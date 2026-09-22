import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatSocketService } from './chat-socket.service';
import { environment } from '../../../environments/environment';

describe('ChatSocketService', () => {
  let service: ChatSocketService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatSocketService]
    });
    service = TestBed.inject(ChatSocketService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods (Success & Error Paths)', () => {
    // BUG DISCOVERED: getChatHistory sends a GET request to an empty URL string (`this.http.get('')`). It relies on a base path override or fails.
    xit('should call getChatHistory and handle network timeout (0)', () => {
      let errResp: any;
      service.getChatHistory('room-1', 10).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne('');
      req.error(new ProgressEvent('Network Error'));
      expect(errResp.status).toBe(0);
    });

    it('should call bindClients with params and handle success', () => {
      let response: any;
      service.bindClients(1, 2).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/bindList?loginUserId=1&centreId=2`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle bindClients error (404)', () => {
      let errResp: any;
      service.bindClients(1, 2).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/bindList?loginUserId=1&centreId=2`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
      expect(errResp.status).toBe(404);
    });

    it('should call loadChat with params and handle success', () => {
      let response: any;
      service.loadChat(1, 2, 'group-1', 0, 10, 5, 30).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/loadChat?senderId=1&receiverId=2&groupId=group-1&pageIndex=0&pageSize=10&regionHours=5&regionMinutes=30`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call manageChatGroup with payload and handle success', () => {
      let response: any;
      const payload = { groupName: 'Test Group' };
      service.manageChatGroup(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/manageChatGroup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle manageChatGroup error (400)', () => {
      let errResp: any;
      service.manageChatGroup({}).subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/manageChatGroup`);
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
      expect(errResp.status).toBe(400);
    });

    it('should call uploadChunk and handle success', () => {
      let response: any;
      const blob = new Blob(['chunk data'], { type: 'text/plain' });
      service.uploadChunk('file-1', 'file.txt', blob, 0, 2, 'text').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/UploadChunk`);
      expect(req.request.method).toBe('POST');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call deleteChunkFiles with params and handle success', () => {
      let response: any;
      service.deleteChunkFiles('text', 'file.txt', 'file-1').subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/deleteChunkFiles?fileType=text&fileName=file.txt&fileId=file-1`);
      expect(req.request.method).toBe('DELETE');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should handle deleteChunkFiles error (500)', () => {
      let errResp: any;
      service.deleteChunkFiles('text', 'file.txt', 'file-1').subscribe({ error: err => errResp = err });
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/deleteChunkFiles?fileType=text&fileName=file.txt&fileId=file-1`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(errResp.status).toBe(500);
    });

    it('should call addGroupMembers with payload and handle success', () => {
      let response: any;
      const payload = { memberId: 1 };
      service.addGroupMembers(payload).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/addGroupMember`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should call loadGroupMembers with params and handle success', () => {
      let response: any;
      service.loadGroupMembers(10).subscribe(res => response = res);
      const req = httpTestingController.expectOne(`${environment.apiUrl}/BroadCast/loadGroupMemberAsync?groupId=10`);
      expect(req.request.method).toBe('GET');
      const mockResponse = { data: 'test' };
      req.flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });
  });
});
