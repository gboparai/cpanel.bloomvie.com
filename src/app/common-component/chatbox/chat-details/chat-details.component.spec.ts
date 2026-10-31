import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatDetailsComponent } from './chat-details.component';
import { ChatSocketService } from '../chat-socket.service';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { DomSanitizer } from '@angular/platform-browser';
import { CommonService } from '../../common.service';
import { NO_ERRORS_SCHEMA, signal, SimpleChange } from '@angular/core';
import { of } from 'rxjs';

describe('ChatDetailsComponent', () => {
  let component: ChatDetailsComponent;
  let fixture: ComponentFixture<ChatDetailsComponent>;

  let mockChatService: any;
  let mockCookieService: jasmine.SpyObj<CookieService>;
  let mockToastr: jasmine.SpyObj<ToastrService>;
  let mockSpinner: jasmine.SpyObj<NgxSpinnerService>;
  let mockSanitizer: jasmine.SpyObj<DomSanitizer>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  beforeEach(async () => {
    (window as any).$ = jasmine.createSpy('$').and.returnValue({
      modal: jasmine.createSpy('modal'),
      animate: jasmine.createSpy('animate')
    });

    mockChatService = {
      getMessagesSeen: jasmine.createSpy('getMessagesSeen').and.returnValue(of(1)),
      loadChat: jasmine.createSpy('loadChat').and.returnValue(of({ message: 'OK', result: [] })),
      loadClassroomChat: jasmine.createSpy('loadClassroomChat').and.returnValue(of({ message: 'Success', result: [] })),
      sendMessage: jasmine.createSpy('sendMessage'),
      sendGroupMessage: jasmine.createSpy('sendGroupMessage'),
      sendClassroomMessage: jasmine.createSpy('sendClassroomMessage').and.returnValue(Promise.resolve()),
      markMessagesAsRead: jasmine.createSpy('markMessagesAsRead'),
      cancelUpload: jasmine.createSpy('cancelUpload'),
      deleteChunkFiles: jasmine.createSpy('deleteChunkFiles').and.returnValue(of({ message: 'Success' })),
      tempClientData: {}
    };

    mockCookieService = jasmine.createSpyObj('CookieService', ['get', 'set', 'delete', 'check']);
    mockCookieService.check.and.returnValue(true);
    mockCookieService.get.and.callFake((key: string) => {
      if (key === 'UserId') return '10';
      return '';
    });

    mockToastr = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    mockSpinner = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);

    mockSanitizer = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustUrl',
      'bypassSecurityTrustResourceUrl'
    ]);
    mockSanitizer.bypassSecurityTrustUrl.and.callFake((url: string) => url as any);
    mockSanitizer.bypassSecurityTrustResourceUrl.and.callFake((url: string) => url as any);

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'convertS3File',
      'base64ToBlobUrl',
      'blobToFile',
      'uploadImages',
      'manageMasterDocument'
    ]);
    mockCommonService.regionResponseSignal = signal({ totalOffsetMinutes: 0, offsetHours: 0, offsetMinutes: 0, offsetString: '+00:00' }) as any;
    mockCommonService.convertS3File.and.returnValue('data:image/png...');
    mockCommonService.base64ToBlobUrl.and.returnValue('blob:http://localhost/file');

    await TestBed.configureTestingModule({
      imports: [ChatDetailsComponent],
      providers: [
        { provide: ChatSocketService, useValue: mockChatService },
        { provide: CookieService, useValue: mockCookieService },
        { provide: ToastrService, useValue: mockToastr },
        { provide: NgxSpinnerService, useValue: mockSpinner },
        { provide: DomSanitizer, useValue: mockSanitizer },
        { provide: CommonService, useValue: mockCommonService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(ChatDetailsComponent, {
      set: { imports: [CommonModule], schemas: [NO_ERRORS_SCHEMA] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create the ChatDetailsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('shows the classroom name and replying teacher in the parent view', () => {
    fixture.detectChanges();
    component.receiverData = {
      name: 'Teachers',
      className: 'Busy Bees',
      isParent: true,
      isStudentThread: true,
      isAdminOnly: false,
    };
    component.chatList = [
      {
        type: 'receiver',
        data: {
          senderName: 'Taylor Jones',
          message: 'We will follow up tomorrow.',
          timestamp: '2026-10-25T11:00:00Z',
          chatFiles: [],
        },
      },
    ];

    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.chat__sender-name').textContent.trim())
      .toBe('Taylor Jones');
    expect(fixture.nativeElement.querySelector('.chat-member__name').textContent.trim())
      .toBe('Teachers');
    expect(fixture.nativeElement.querySelector('.chat-member__status').textContent.trim())
      .toBe('Busy Bees');
  });

  describe('ngOnInit', () => {
    it('should initialize receiver default name and listen to messages seen', () => {
      component.ngOnInit();
      expect(component.receiverData['name']).toBe('Unknown User');
      expect(mockChatService.getMessagesSeen).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    it('does not request legacy history before a direct-chat recipient is available', () => {
      component.receiverData = {};

      component.loadData();

      expect(mockChatService.loadChat).not.toHaveBeenCalled();
      expect(mockChatService.loadClassroomChat).not.toHaveBeenCalled();
      expect(component.chatList).toEqual([]);
      expect(component.isLoading).toBeFalse();
    });

    it('loads the authorized student classroom thread', () => {
      component.receiverData = {
        id: 15,
        studentId: 15,
        threadId: 'STUDENT-15',
        isStudentThread: true,
        isAdminOnly: false,
      };

      component.ngOnChanges({
        receiverData: new SimpleChange({}, component.receiverData, false),
      });

      expect(mockChatService.loadClassroomChat).toHaveBeenCalledWith(
        15,
        false,
        1,
        100,
        0,
        0,
      );
      expect(mockChatService.loadChat).not.toHaveBeenCalled();
    });

    it('should append newChat message to chatList when newChat changes', () => {
      component.chatList = [];
      component.newChat = { message: 'Hello World', senderId: 5 };
      component.ngOnChanges({
        newChat: new SimpleChange(null, component.newChat, false)
      });

      expect(component.chatList.length).toBe(1);
      expect(component.chatList[0].message).toBe('Hello World');
    });
  });

  describe('sendMessage', () => {
    beforeEach(() => {
      component.senderId = 10;
      component.receiverData = {
        id: 15,
        studentId: 15,
        threadId: 'ADMIN-15',
        isStudentThread: true,
        isAdminOnly: true,
      };
      component.messageToSend = 'A private concern';
    });

    it('sends a private message to the selected student admin thread and clears the composer', async () => {
      spyOn(component, 'scrollToBottom');
      await component.sendMessage();

      expect(mockChatService.sendClassroomMessage).toHaveBeenCalledWith({
        studentId: 15,
        isAdminOnly: true,
        message: 'A private concern',
        chatFiles: [],
      });
      expect(component.messageToSend).toBe('');
      expect(mockToastr.error).not.toHaveBeenCalled();
    });

    it('keeps the message available and reports a failed classroom send', async () => {
      mockChatService.sendClassroomMessage.and.returnValue(Promise.reject(new Error('offline')));

      await component.sendMessage();

      expect(component.messageToSend).toBe('A private concern');
      expect(mockToastr.error).toHaveBeenCalledWith('Message could not be sent. Please try again.');
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes to appropriate human-readable units', () => {
      expect(component.formatFileSize(0)).toBe('0 B');
      expect(component.formatFileSize(1024)).toBe('1.00 KB');
      expect(component.formatFileSize(1048576)).toBe('1.00 MB');
    });
  });

  describe('removeFile', () => {
    it('should remove file at index from filesToUpload', () => {
      component.filesToUpload = [
        { name: 'file1.png', size: 100, type: 'image/png', status: 'ready', progress: 0, fileId: '1', file: new File([], 'file1.png') },
        { name: 'file2.png', size: 200, type: 'image/png', status: 'ready', progress: 0, fileId: '2', file: new File([], 'file2.png') }
      ];

      component.removeFile(0);
      expect(component.filesToUpload.length).toBe(1);
      expect(component.filesToUpload[0].name).toBe('file2.png');
    });
  });

  describe('toggleEmojiPicker and addEmoji', () => {
    it('should toggle showEmojiPicker', () => {
      expect(component.showEmojiPicker).toBeFalse();
      component.toggleEmojiPicker();
      expect(component.showEmojiPicker).toBeTrue();
    });

    it('should append emoji native character to messageToSend', () => {
      component.messageToSend = 'Hello ';
      component.addEmoji({ emoji: { native: '😊' } });
      expect(component.messageToSend).toBe('Hello 😊');
    });
  });

  describe('getCleanFileName', () => {
    it('should clean timestamp prefix from filename', () => {
      const clean = component.getCleanFileName('1715000000000_receipt.pdf');
      expect(clean).toBe('receipt.pdf');
    });
  });

  describe('makeFileNameUnique', () => {
    it('should prepend timestamp to filename', () => {
      const unique = component.makeFileNameUnique('test.png');
      expect(unique).toMatch(/^test_\d+\.png$/);
    });
  });

  describe('getMimeTypeFromExtension', () => {
    it('should return correct mime type for common extensions', () => {
      expect(component.getMimeTypeFromExtension('pdf')).toBe('application/pdf');
      expect(component.getMimeTypeFromExtension('.png')).toBe('image/png');
      expect(component.getMimeTypeFromExtension('JPG')).toBe('image/jpeg');
      expect(component.getMimeTypeFromExtension('application/pdf')).toBe('application/pdf');
      expect(component.getMimeTypeFromExtension('xyz')).toBe('application/octet-stream');
    });
  });
});
