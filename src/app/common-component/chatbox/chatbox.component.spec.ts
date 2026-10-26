import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ChatboxComponent } from './chatbox.component';
import { ChatSocketService } from './chat-socket.service';
import { CookieService } from 'ngx-cookie-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject } from 'rxjs';

describe('ChatboxComponent', () => {
  let component: ChatboxComponent;
  let fixture: ComponentFixture<ChatboxComponent>;

  let mockChatService: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    mockChatService = {
      bindClients: jasmine.createSpy('bindClients').and.returnValue(of({
        message: 'OK',
        result: [
          { id: 1, name: 'Alice Teacher', isGroup: false },
          { id: 2, name: 'Toddler Room Group', isGroup: true }
        ]
      })),
      fetchActiveUsers: jasmine.createSpy('fetchActiveUsers'),
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

    await TestBed.configureTestingModule({
      imports: [ChatboxComponent],
      providers: [
        { provide: ChatSocketService, useValue: mockChatService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: ToastrService, useValue: mockToastr }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ChatboxComponent, {
      set: { imports: [], schemas: [NO_ERRORS_SCHEMA] }
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
      expect(mockChatService.bindClients).toHaveBeenCalled();
      expect(mockChatService.fetchActiveUsers).toHaveBeenCalled();
      expect(component.clientList.length).toBe(2);
      expect(component.skeletonShow).toBe('');
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
