import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatboxComponent } from './chatbox.component';
import { ChatSocketService } from './chat-socket.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { HeaderServiceService } from '../../layout/header/header-service.service';

describe('ChatboxComponent', () => {
  let component: ChatboxComponent;
  let fixture: ComponentFixture<ChatboxComponent>;

  let mockChatService: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockHeaderService: { switchProfile: ReturnType<typeof signal<number>> };

  beforeEach(async () => {
    mockChatService = {
      bindClients: jasmine.createSpy('bindClients').and.returnValue(of({
        message: 'Success',
        result: [
          { id: 1, name: 'Alice Teacher', isGroup: false },
          { id: 2, name: 'Toddler Room Group', isGroup: true }
        ]
      })),
      classroomThreads: jasmine.createSpy('classroomThreads').and.returnValue(of({
        message: 'Success',
        result: [
          { id: 1, studentId: 1, threadId: 'STUDENT-1', name: 'Avery Jones', classId: 2, className: 'Toddlers', isStudentThread: true },
          { id: 1, studentId: 1, threadId: 'ADMIN-1', name: 'Avery Jones', classId: 2, className: 'Toddlers', isStudentThread: true, isAdminOnly: true }
        ]
      })),
      fetchActiveUsers: jasmine.createSpy('fetchActiveUsers'),
      markClassroomThreadRead: jasmine.createSpy('markClassroomThreadRead').and.returnValue(of({ message: 'Success' })),
      manageChatGroup: jasmine.createSpy('manageChatGroup').and.returnValue(of({ message: 'OK' })),
      markMessagesAsRead: jasmine.createSpy('markMessagesAsRead'),
      messageReceived$: of({ data: { senderId: 5, receiverId: 10 } }),
      activeUsers$: of(['1', '2']),
      getMessagesSeen: jasmine.createSpy('getMessagesSeen').and.returnValue(of(1)),
      tempClientData: {}
    };

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.check.and.returnValue(true);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      if (key === 'UserRoleId') return '8';
      if (key === 'CentreID') return '5';
      return '';
    });

    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockHeaderService = { switchProfile: signal(0) };

    await TestBed.configureTestingModule({
      imports: [ChatboxComponent],
      providers: [
        { provide: ChatSocketService, useValue: mockChatService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr },
        { provide: HeaderServiceService, useValue: mockHeaderService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ChatboxComponent, {
      set: { imports: [CommonModule, FormsModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatboxComponent);
    component = fixture.componentInstance;
  });

  it('should create the ChatboxComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize sender and role properties and call bindClients and fetchActiveUsers', () => {
      component.ngOnInit();

      expect(component.senderId).toBe(10);
      expect(component.userRoleID).toBe(8);
      expect(component.centreId).toBe(5);
      expect(mockChatService.bindClients).not.toHaveBeenCalled();
      expect(mockChatService.classroomThreads).toHaveBeenCalled();
      expect(mockChatService.fetchActiveUsers).toHaveBeenCalled();
      expect(component.clientList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
    });

    it('filters classroom threads by the selected classroom', () => {
      component.clientList = [
        { id: 1, name: 'Avery Jones', classId: 2 },
        { id: 2, name: 'Riley Smith', classId: 3 }
      ];
      component.selectedClassId = 2;

      expect(component.filteredClientList.map(client => client.name)).toEqual(['Avery Jones']);
    });

    it('uses classroom threads for daycare admins instead of legacy direct chats', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '10';
        if (key === 'UserRoleId') return '3';
        return '';
      });

      component.ngOnInit();

      expect(component.isClassroomChat).toBeTrue();
      expect(mockChatService.classroomThreads).toHaveBeenCalled();
      expect(mockChatService.bindClients).not.toHaveBeenCalled();
    });

    it('uses classroom threads when login provides the lowercase role cookie', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '10';
        if (key === 'userRoleID') return '4';
        return '';
      });

      component.ngOnInit();

      expect(component.userRoleID).toBe(4);
      expect(component.isClassroomChat).toBeTrue();
      expect(mockChatService.classroomThreads).toHaveBeenCalled();
      expect(mockChatService.bindClients).not.toHaveBeenCalled();
    });

    it('does not mark a classroom thread as read merely because it was auto-selected', () => {
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '10';
        if (key === 'userRoleID') return '4';
        return '';
      });

      component.ngOnInit();
      fixture.detectChanges();

      expect(component.receiverData.threadId).toBe('STUDENT-1');
      expect(mockChatService.markClassroomThreadRead).not.toHaveBeenCalled();
      const threadName = fixture.nativeElement.querySelector('.messaging-member__name');
      expect(threadName.textContent.trim()).toBe('Avery Jones');
      expect(threadName.textContent).not.toContain('Student:');
    });

    it('shows only the active parent profile’s classroom and admin conversations', () => {
      mockChatService.classroomThreads.and.returnValue(of({
        message: 'Success',
        result: [
          { id: 1, studentId: 1, threadId: 'STUDENT-1', name: 'Avery Jones', className: 'Toddlers', isStudentThread: true },
          { id: 1, studentId: 1, threadId: 'ADMIN-1', name: 'Avery Jones', adminName: 'Willow Admin', className: 'Toddlers', isStudentThread: true, isAdminOnly: true },
          { id: 2, studentId: 2, threadId: 'STUDENT-2', name: 'Riley Smith', isStudentThread: true },
          { id: 2, studentId: 2, threadId: 'ADMIN-2', name: 'Riley Smith', isStudentThread: true, isAdminOnly: true }
        ]
      }));
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '10';
        if (key === 'userRoleID') return '5';
        if (key === 'StudentID') return '1';
        return '';
      });

      component.ngOnInit();

      expect(component.userRoleID).toBe(5);
      expect(component.currentStudentId).toBe(1);
      expect(component.isClassroomChat).toBeTrue();
      expect(component.canFilterClassrooms).toBeFalse();
      expect(mockChatService.classroomThreads).toHaveBeenCalledWith(undefined, 1);
      expect(mockChatService.bindClients).not.toHaveBeenCalled();
      expect(component.filteredClientList.map(thread => thread.threadId))
        .toEqual(['STUDENT-1', 'ADMIN-1']);

      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('select[aria-label="Select student"]')).toBeNull();
      expect(fixture.nativeElement.querySelector('select[aria-label="Filter chats by classroom"]')).toBeNull();
      const parentConversationList = fixture.nativeElement.querySelector('.messages-page__list');
      expect(parentConversationList.textContent).toContain('Teachers');
      expect(parentConversationList.textContent).toContain('Toddlers');
      expect(parentConversationList.textContent).toContain('Willow Admin');
      expect(parentConversationList.textContent).toContain('Private chat with daycare admin');
      expect(parentConversationList.textContent).not.toContain('Avery Jones');
      expect(parentConversationList.textContent).not.toContain('Riley Smith');
      expect(component.receiverData.name).toBe('Teachers');
    });

    it('reloads parent conversations when the active profile changes', fakeAsync(() => {
      let activeStudentId = '1';
      mockCookieService.get.and.callFake((key: string) => {
        if (key === 'UserId') return '10';
        if (key === 'userRoleID') return '5';
        if (key === 'StudentID') return activeStudentId;
        return '';
      });

      component.ngOnInit();
      expect(mockChatService.classroomThreads).toHaveBeenCalledWith(undefined, 1);

      activeStudentId = '2';
      mockHeaderService.switchProfile.set(1);
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.currentStudentId).toBe(2);
      expect(mockChatService.classroomThreads).toHaveBeenCalledWith(undefined, 2);
    }));

    it('allows teachers and daycare admins to filter classroom threads', () => {
      component.userRoleID = 4;
      expect(component.canFilterClassrooms).toBeTrue();

      component.userRoleID = 3;
      expect(component.canFilterClassrooms).toBeTrue();
    });
  });

  describe('toggleGroupCreate', () => {
    it('should toggle isAddGroup boolean', () => {
      expect(component.isAddGroup).toBeFalse();
      component.toggleGroupCreate();
      expect(component.isAddGroup).toBeTrue();
      component.toggleGroupCreate();
      expect(component.isAddGroup).toBeFalse();
    });
  });

  describe('filteredClientList', () => {
    it('should filter clients by searchTerm case-insensitively', () => {
      component.clientList = [
        { id: 1, name: 'Alice Teacher' },
        { id: 2, name: 'Bob Parent' }
      ];
      component.searchTerm = 'alice';
      expect(component.filteredClientList.length).toBe(1);
      expect(component.filteredClientList[0].name).toBe('Alice Teacher');
    });
  });

  describe('receiveFromChild', () => {
    it('should update client logo when bind-logo event is received', () => {
      component.clientList = [
        { id: 5, name: 'Group 5', isGroup: true, fileUrl: '' }
      ];
      component.receiveFromChild({
        type: 'bind-logo',
        data: { groupId: 5, documentImagePath: 'https://img/', documentImage: 'logo.png' }
      });

      expect(component.clientList[0].fileUrl).toBe('https://img/logo.png');
    });
  });

  describe('onClientSwitch', () => {
    it('should switch active client and set receiverData', () => {
      const client = { id: 2, name: 'Bob', isGroup: false };
      component.onClientSwitch(client);

      expect(component.receiverData).toBe(client);
      expect(mockChatService.tempClientData).toBe(client);
    });

    it('clears only the selected student thread unread count without using direct-chat read receipts', () => {
      const studentThread = {
        id: 2,
        studentId: 2,
        threadId: 'STUDENT-2',
        isStudentThread: true,
        unreadMessageCount: 1,
      };
      component.clientList = [
        { ...studentThread },
        {
          ...studentThread,
          threadId: 'ADMIN-2',
          isAdminOnly: true,
          unreadMessageCount: 4,
        },
      ];

      component.onClientSwitch(component.clientList[0]);

      expect(mockChatService.markMessagesAsRead).not.toHaveBeenCalled();
      expect(mockChatService.markClassroomThreadRead).toHaveBeenCalledWith(2, false);
      expect(component.clientList[0].unreadMessageCount).toBe(0);
      expect(component.clientList[1].unreadMessageCount).toBe(4);
      expect(component.receiverData.isOnline).toBeFalse();
    });

    it('marks a student thread read only after the user explicitly selects it', () => {
      const thread = {
        studentId: 7,
        threadId: 'STUDENT-7',
        isStudentThread: true,
        unreadMessageCount: 1,
      };

      component.onClientSwitch(thread, false);
      expect(mockChatService.markClassroomThreadRead).not.toHaveBeenCalled();

      component.onClientSwitch(thread);
      expect(mockChatService.markClassroomThreadRead).toHaveBeenCalledWith(7, false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should clear receiverData on destroy', () => {
      component.receiverData = { id: 1 };
      component.ngOnDestroy();
      expect(component.receiverData).toEqual({});
      expect(mockChatService.tempClientData).toEqual({});
    });
  });
});
