import { Component, OnDestroy, OnInit, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import io from 'socket.io-client';
import { ChatSocketService } from './chat-socket.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { ChatDetailsComponent } from './chat-details/chat-details.component';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import * as ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import { json } from 'stream/consumers';
import cli from '@angular/cli';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { HeaderServiceService } from '../../layout/header/header-service.service';

const SOCKET_ENDPOINT = 'localhost:3000';
@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [
    RouterLink,
    BreadcrumbComponent,
    FormsModule,
    CommonModule,
    ChatDetailsComponent,
    ChatDetailsComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './chatbox.component.html',
  styleUrl: './chatbox.component.css',
})
export class ChatboxComponent implements OnInit, OnDestroy {
  public chatRoomId = '1';
  public senderId = 0;
  public newChat: any = {};
  roleType: any;
  public receiverData: any = {};
  public clientList: any[] = [];
  public searchTerm: string = '';
  public activeUsers: string[] = [];
  public isAddGroup: boolean = false;
  public selectedGroupMembers: number[] = [];
  public selectedClassId: number | null = null;
  public currentStudentId: number | null = null;
  public classroomClasses: { id: number; name: string }[] = [];
  private isCurrentThreadExplicitlyOpened = false;
  public readonly baseUrl: string = environment.apiUrl.slice(0, -3);
  userRoleID: number = 0;
  centreId: number = 0;
  constructor(
    private chatService: ChatSocketService,
    private cookie: CookieService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private headerService: HeaderServiceService
  ) {
    let profileVersion = this.headerService.switchProfile();
    effect(() => {
      const nextProfileVersion = this.headerService.switchProfile();
      if (nextProfileVersion !== profileVersion) {
        profileVersion = nextProfileVersion;
        if (this.userRoleID === 5) {
          const studentId = Number.parseInt(this.cookie.get('StudentID'), 10);
          this.currentStudentId = Number.isFinite(studentId) && studentId > 0
            ? studentId
            : null;
          this.bindClients();
        }
      }
    });
  }
  skeletonShow = 'Skelton';

  ngOnInit(): void {
    if (this.cookie.check('UserId')) {
      this.senderId = parseInt(this.cookie.get('UserId'));

      //Added on 12/08/25
      const roleId = this.cookie.get('userRoleID') || this.cookie.get('UserRoleId');
      this.userRoleID = Number.parseInt(roleId, 10) || 0;
      if (this.userRoleID === 5) {
        const studentId = Number.parseInt(this.cookie.get('StudentID'), 10);
        this.currentStudentId = Number.isFinite(studentId) && studentId > 0
          ? studentId
          : null;
      }
      if (this.userRoleID == 8) {
        this.centreId = parseInt(this.cookie.get('CentreID'));
      }

      this.bindClients();
      // this.loadChatHistory();
      this.listenForMessages();
      this.listenClientStatus();
      this.chatService.fetchActiveUsers();
    }

  }

  ngOnDestroy(): void {
    this.receiverData = {};
    this.chatService.tempClientData = {};
  }

  toggleGroupCreate = () => (this.isAddGroup = !this.isAddGroup);

  get filteredClientList(): any[] {
    return this.clientList.filter((x) =>
      (x.name || '').toLocaleLowerCase().includes(this.searchTerm.toLocaleLowerCase()) &&
      (this.userRoleID !== 5 || x.studentId === this.currentStudentId) &&
      (this.selectedClassId === null || x.classId === this.selectedClassId)
    );
  }

  get isClassroomChat(): boolean {
    return [3, 4, 5, 8].includes(this.userRoleID);
  }

  get canFilterClassrooms(): boolean {
    return [3, 4, 8].includes(this.userRoleID);
  }

  receiveFromChild(event: { type: string; data: any }) {
    if (event.type === 'bind-logo') {
      const client = this.clientList.find(
        (x) => x.id === event.data.groupId && x.isGroup
      );
      if (client) {
        client.fileUrl = `${event.data.documentImagePath}${event.data.documentImage}`;
      }
    }
  }

  addGroup() {
    Swal.fire({
      title: '<span style="color:#4A90E2;">Create a New Group</span>',
      html: `
    <p style="font-size:14px; color:#555;">Enter the name for your new group below:</p>
  `,
      input: 'text',
      inputPlaceholder: 'Type your group name here...',
      showCancelButton: true,
      confirmButtonText: '<i class="fa fa-check"></i> Create Group',
      cancelButtonText: '<i class="fa fa-times"></i> Cancel',
      background: '#f9f9f9',
      confirmButtonColor: '#4A90E2',
      cancelButtonColor: '#aaa',
      inputAttributes: {
        'aria-label': 'Type your group name here',
        style: 'padding: 10px; border-radius: 4px; border: 1px solid #ccc;',
      },
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'custom-confirm-button',
        cancelButton: 'custom-cancel-button',
      },
      preConfirm: (groupName) => {
        if (!groupName || groupName.trim() === '') {
          Swal.showValidationMessage('🚫 Group name is required!');
          return false;
        }
        return groupName.trim();
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          groupAdminId: this.senderId,
          groupName: result.value,
          groupMembersListId: this.selectedGroupMembers,
        };
        this.spinner.show();
        this.chatService.manageChatGroup(payload).subscribe({
          next: (response) => {
            if (response.message === 'Success') {
              Swal.fire('Group created successfully!', '', 'success');
              this.bindClients();
              this.selectedGroupMembers = [];
              this.isAddGroup = false;
            } else {
              Swal.fire({
                title: 'Something went wrong!!!',
                text: response.message,
                icon: 'warning',
              });
            }
            setTimeout(() => {
              this.spinner.hide();
            }, 300);
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err.message);
          },
        });
      }
    });
  }

  onSelectGroupMember(Id: number, event: any) {
    if (event.checked) {
      this.selectedGroupMembers.push(Id);
    } else {
      const index = this.selectedGroupMembers.findIndex(
        (memberId) => memberId === Id
      );
      if (index !== -1) {
        this.selectedGroupMembers.splice(index, 1);
      }
    }
  }

  bindClients(canswitch: boolean = true) {
    // this.spinner.show();
    this.skeletonShow = 'Skelton';

    //Added on 12/08/25 centreId added for TOC user
    var centreId = 0;
    if (this.userRoleID == 8) {
      centreId = this.centreId;
    }
    else {
      centreId = 0;
    }
    //End

    const request = this.isClassroomChat
      ? this.chatService.classroomThreads(
          this.selectedClassId ?? undefined,
          this.userRoleID === 5 ? this.currentStudentId ?? undefined : undefined
        )
      : this.chatService.bindClients(this.senderId, Number(centreId));
    request.subscribe({
      next: (response) => {
        if (response.message === 'Success') {
          this.clientList = (response.result ?? []).map((thread: any) => ({
            ...thread,
            name: this.userRoleID === 5
              ? thread.isAdminOnly
                ? thread.adminName || 'Daycare admin'
                : 'Teachers'
              : thread.name,
            isParent: this.userRoleID === 5,
          }));
          this.roleType = response.result?.roleType;
          this.classroomClasses = this.canFilterClassrooms
            ? this.clientList
                .filter((thread: any) => thread.classId != null)
                .reduce((classes: { id: number; name: string }[], thread: any) => {
                  if (!classes.some(item => item.id === thread.classId)) {
                    classes.push({ id: thread.classId, name: thread.className || 'Classroom' });
                  }
                  return classes;
                }, [])
            : [];
          if (canswitch && this.clientList.length) {
            const initialThread = this.userRoleID === 5
              ? this.clientList.find(thread => thread.studentId === this.currentStudentId)
              : this.clientList[0];
            if (initialThread) this.onClientSwitch(initialThread, false);
          } else if (!canswitch) {
            const switchedUser = this.clientList.find(
              (x: any) => x.threadId === this.receiverData.threadId || x.id === this.receiverData.id
            );
            if (switchedUser) this.onClientSwitch(switchedUser, false);
          }
        } else {
          this.clientList = [];
          this.classroomClasses = [];
          this.receiverData = {};
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
      complete: () => {
        // setTimeout(() => {
        //   this.spinner.hide();
        // }, 300);
        this.skeletonShow = '';
      },
    });
  }

  // Load chat history
  // private loadChatHistory(): void {
  //   this.chatService.getChatHistory(this.chatRoomId, 50).subscribe((data) => {
  //   });
  // }

  private listenClientStatus(): void {
    this.chatService.activeUsers$.subscribe((users) => {
      this.activeUsers = users;
      this.receiverData['isOnline'] = this.activeUsers.includes(
        this.receiverData.id?.toString()
      );
    });
  }

  // Listen for new messages
  private listenForMessages(): void {
    this.chatService.messageReceived$.subscribe((message: any) => {
      const isGroupMessage = message.data.chatRoomId?.includes('G');
      const threadId = message.data.chatRoomId;
      const isClassroomThread = /^(STUDENT|ADMIN)-\d+$/.test(threadId || '');
      let isMessageForCurrentUser = false;

      const { receiverId, senderId } = message.data;
      let affectedClient;
      if (isClassroomThread) {
        affectedClient = this.clientList.find((x) => x.threadId === threadId);
        isMessageForCurrentUser = this.receiverData.threadId === threadId;
      } else if (isGroupMessage) {
        const groupId = parseInt(message.data.chatRoomId.split('-')[1]);
        affectedClient = this.clientList.find(
          (x) => x.id === groupId && x.isGroup
        );
        isMessageForCurrentUser =
          this.receiverData.isGroup && groupId === this.receiverData['id'];
      } else {
        affectedClient = this.clientList.find(
          (x) => x.id === message.data.senderId && !x.isGroup
        );
        isMessageForCurrentUser =
          receiverId === this.receiverData['receiverId'] ||
          senderId === this.receiverData['receiverId'];
      }

      if (isMessageForCurrentUser) {
        if (isGroupMessage && senderId === this.senderId) {
          message['type'] = 'sender';
        }
        if (senderId === this.receiverData.receiverId && !isGroupMessage && !isClassroomThread) {
          this.markMessagesAsRead();
        }
        if (isClassroomThread && this.isCurrentThreadExplicitlyOpened) {
          this.markClassroomThreadRead(this.receiverData);
        }
        this.newChat = message;
      }
      if (affectedClient) {
        if (!isMessageForCurrentUser) {
          affectedClient.unreadMessageCount = (affectedClient.unreadMessageCount ?? 0) + 1;
        }
        affectedClient.lastMessage = message.data.message;
        affectedClient.lastMessageTimestamp = message.data.timestamp;

        this.clientList.sort(
          (a, b) =>
            new Date(b.lastMessageTimestamp).getTime() -
            new Date(a.lastMessageTimestamp).getTime()
        );
      }
    });
  }

  markMessagesAsRead() {
    this.chatService.markMessagesAsRead(
      this.receiverData.receiverId,
      this.senderId
    );
  }

  updateClientLists(clientId: string, updates: Partial<any>) {
    const client = this.clientList.find((x) =>
      x.isStudentThread ? x.threadId === clientId : x.id === clientId
    );
    if (client) {
      Object.assign(client, updates);
    }
  }

  onClientSwitch(client: any, markAsRead: boolean = true) {
    this.receiverData = client;
    this.isCurrentThreadExplicitlyOpened = markAsRead;
    this.receiverData['isOnline'] = !client.isStudentThread &&
      client.id != null &&
      this.activeUsers.includes(client.id.toString());
    if (client.isGroup)
      this.receiverData['clientList'] = this.clientList.filter(
        (x) => !x.isGroup
      );
    this.chatService.tempClientData = client;
    if (client.isStudentThread && markAsRead) {
      this.markClassroomThreadRead(client);
    } else if (markAsRead && client.unreadMessageCount) {
      this.markMessagesAsRead();
      this.updateClientLists(
        client.id,
        { unreadMessageCount: 0 }
      );
    }
  }

  private markClassroomThreadRead(thread: any): void {
    this.chatService
      .markClassroomThreadRead(thread.studentId, !!thread.isAdminOnly)
      .subscribe({
        next: () => this.updateClientLists(thread.threadId, { unreadMessageCount: 0 }),
        error: (err) => this.toastr.error(err.message || 'Unable to mark the conversation as read.'),
      });
  }
}
