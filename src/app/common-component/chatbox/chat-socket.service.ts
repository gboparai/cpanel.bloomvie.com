import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HeaderServiceService } from '../../layout/header/header-service.service';


@Injectable({
  providedIn: 'root'
})
export class ChatSocketService {
  private readonly rootUrl = environment.apiUrl;
  private hubConnection: signalR.HubConnection | undefined;
  private messageReceivedSubject = new Subject<any>();
  messageReceived$ = this.messageReceivedSubject.asObservable();
  private messagesSeenSubject = new Subject<number>();
  private activeUsersSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public activeUsers$: Observable<string[]> = this.activeUsersSubject.asObservable();

  public tempClientData: any = {};
  private loginUserId: any;

  private cancelUploadSubjects: { [key: string]: Subject<void> } = {};


  constructor(private http: HttpClient,
    private cookie: CookieService,
    private headerService: HeaderServiceService) { }

  public startConnection(): void {
    if (this.cookie.check('UserId')) {
      this.loginUserId = this.cookie.get('UserId');

    };
    if (!this.loginUserId) return;
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.rootUrl.slice(0, -3)}chatHub`, {
        accessTokenFactory: () => {
          const userInfo = this.cookie.get('UserInfo');
          return userInfo ? JSON.parse(userInfo).token ?? '' : '';
        },
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().then(() => {

      this.addReceiveMessageListener();
      this.addSeenMeesageListener();
      this.addClientStatusChangeListener();
      this.fetchActiveUsers();
    })
      .catch((err) => console.error('Error starting SignalR connection:', err));
  }


  // stopConnection(): void {
  //   if (this.hubConnection) {
  //     this.hubConnection
  //       .stop()
  //       .then(() => console.log('Connection stopped'))
  //       .catch(err => console.error('Error stopping connection:', err));
  //   }
  // }

  //Added on 25/08/25 without console log
  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().catch(err => console.error('Error stopping connection:', err));
    }
  }



  // Send a message
  public sendMessage(messagePayload: any): void {
    if (this.hubConnection) {
      this.hubConnection
        .invoke('SendMessage', messagePayload)
        .catch((err) => console.error('Error sending message:', err));
    }
  }

  public sendGroupMessage(messagePayload: any): void {
    if (this.hubConnection) {
      this.hubConnection.invoke('SendMessageToGroup', messagePayload).catch((err) => console.error('Error sending message:', err));
    }
  }

  public sendClassroomMessage(messagePayload: any): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject(new Error('The chat connection is not available.'));
    }

    return this.hubConnection.invoke('SendClassroomMessage', messagePayload);
  }

  public addReceiveMessageListener(): void {
    this.hubConnection?.on('ReceiveMessage', (message) => {
      this.messageReceivedSubject.next(message);
      const { receiverId, senderId } = message.data;
      if (this.tempClientData.id !== senderId && senderId !== parseInt(this.loginUserId)) {
        this.headerService.onReceivedNotification();
      }
    });
  }

  public addClientStatusChangeListener(): void {
    this.hubConnection?.on('UpdateActiveUsers', (users: string[]) => {
      this.activeUsersSubject.next(users);
    });
  }

  public addSeenMeesageListener(): void {
    this.hubConnection?.on('MessagesSeen', (receiverId: number) => {
      this.messagesSeenSubject.next(receiverId);
    });
  }

  public fetchActiveUsers(): void {
    if (this.hubConnection?.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    this.hubConnection.invoke('NotifyUserStatusChange').catch(err => console.error(err));
  }


  markMessagesAsRead(senderId: number, receiverId: number): void {
    this.hubConnection?.invoke('MarkMessagesAsRead', senderId, receiverId)
      .catch(err => console.error('Error marking messages as read: ', err));
  }

  getMessagesSeen(): Observable<number> {
    return this.messagesSeenSubject.asObservable();
  }

  // Fetch chat history
  public getChatHistory(chatRoomId: string, count: number): Observable<any> {
    return this.http.get(``);
  }


  bindClients(loginUserId: number, centreId: number): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/BroadCast/bindList', { params: { loginUserId, centreId } });
  }

  classroomThreads(classId?: number, studentId?: number): Observable<any> {
    let params = new HttpParams();
    if (classId !== undefined) {
      params = params.set('classId', classId);
    }
    if (studentId !== undefined) {
      params = params.set('studentId', studentId);
    }
    return this.http.get<any>(this.rootUrl + '/BroadCast/classroomThreads', { params });
  }

  loadClassroomChat(
    studentId: number,
    isAdminOnly: boolean,
    pageIndex: number,
    pageSize: number,
    regionHours: number,
    regionMinutes: number
  ): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/BroadCast/loadClassroomChat', {
      params: {
        studentId,
        isAdminOnly,
        pageIndex,
        pageSize,
        regionHours,
        regionMinutes,
      },
    });
  }

  markClassroomThreadRead(studentId: number, isAdminOnly: boolean): Observable<any> {
    return this.http.post<any>(
      this.rootUrl + '/BroadCast/markClassroomThreadRead',
      null,
      { params: { studentId, isAdminOnly } }
    );
  }

  loadChat(
    senderId: number,
    receiverId: number,
    groupId: string,
    pageIndex: number,
    pageSize: number,
    regionHours: number,
    regionMinutes: number
  ): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/BroadCast/loadChat', {
      params: {
        senderId,
        receiverId,
        groupId,
        pageIndex,
        pageSize,
        regionHours,
        regionMinutes,
      },
    });
  }

  manageChatGroup(postData: any): Observable<any> {
    return this.http.post<any>(this.rootUrl + '/BroadCast/manageChatGroup', postData);
  }

  uploadChunk(fileId: string, fileName: string, chunk: Blob, chunkIndex: number, totalChunks: number, fileType: string) {
    if (!this.cancelUploadSubjects[fileId]) {
      this.cancelUploadSubjects[fileId] = new Subject<void>();
    }
    const formData = new FormData();
    formData.append('file', chunk, fileName);
    formData.append('fileId', fileId);
    formData.append('fileName', fileName);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileType', fileType);

    return this.http.post(this.rootUrl + '/BroadCast/UploadChunk', formData, {
      headers: new HttpHeaders(),
      params: new HttpParams(),
    }).pipe(takeUntil(this.cancelUploadSubjects[fileId]));
  }

  // uploadFile(fileId: string, file: File, fileType: string) {
  //   if (!this.cancelUploadSubjects[fileId]) {
  //     this.cancelUploadSubjects[fileId] = new Subject<void>();
  //   }

  //   const formData = new FormData();
  //   // Must match the API parameter names exactly
  //   formData.append('File', file, file.name);
  //   formData.append('FileId', fileId);
  //   formData.append('FileName', file.name);
  //   formData.append('FileType', fileType);

  //   return this.http.post(this.rootUrl + '/BroadCast/UploadChunk', formData, {
  //     headers: new HttpHeaders(),
  //     params: new HttpParams(),
  //   }).pipe(takeUntil(this.cancelUploadSubjects[fileId]));
  // }



  cancelUpload(fileId: string): void {
    if (this.cancelUploadSubjects[fileId]) {
      this.cancelUploadSubjects[fileId].next();
      this.cancelUploadSubjects[fileId].complete();
      delete this.cancelUploadSubjects[fileId];
    }
  }

  deleteChunkFiles(fileType: string, fileName: string, fileId: string): Observable<any> {
    return this.http.delete<any>(this.rootUrl + '/BroadCast/deleteChunkFiles', { params: { fileType, fileName, fileId } });
  }

  addGroupMembers(postData: any): Observable<any> {
    return this.http.post<any>(this.rootUrl + '/BroadCast/addGroupMember', postData)
  }

  loadGroupMembers(groupId: number): Observable<any> {
    return this.http.get<any>(this.rootUrl + '/BroadCast/loadGroupMemberAsync', { params: { groupId } });
  }
}
