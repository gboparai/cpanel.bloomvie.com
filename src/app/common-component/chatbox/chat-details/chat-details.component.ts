import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, EventEmitter, HostListener, input, Input, OnChanges, OnInit, Output, output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatSocketService } from '../chat-socket.service';
import { CookieService } from 'ngx-cookie-service';
import { totalmem } from 'os';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { environment } from '../../../../environments/environment';
import { lastValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { serialize } from 'v8';
import { CommonService } from '../../common.service';
import imageCompression from 'browser-image-compression';
import { TimeFormatAmPmPipe } from '../../../bloomvie-management/dc-appointments-list/time-format.pipe';
declare var $: any;



@Component({
  selector: 'app-chat-details',
  standalone: true,
  imports: [CommonModule, FormsModule, InfiniteScrollDirective, PickerComponent, TimeFormatAmPmPipe, ImageCropperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './chat-details.component.html',
  styleUrls: ['./chat-details.component.css', '../chatbox.component.css'] // Include the parent's styles
})
export class ChatDetailsComponent implements OnInit {


  onImgError(event: any) {
    event.target.src = '';
  }



  @ViewChild('scrollContainer', { static: true }) scrollContainer!: ElementRef;
  public messageToSend: string = '';
  @Input() senderId: number = 0;
  @Input() newChat: any = {};
  @Input() receiverData: any = {};
  @Output() dataForParent = new EventEmitter<any>();
  public chatList: any[] = [];
  public isLoading: boolean = false;
  public pageIndex: number = 1;
  public pageSize: number = 100;
  public chatGroupId: string = '';
  public showEmojiPicker: boolean = false;
  public isScrollingManually: boolean = false;
  public isReachedLast: boolean = false;
  public uploadedFiles: { fileUrl: string; fileType: string; fileName: string }[] = [];
  public filesToUpload: { file: File; name: string; size: number; type: string; status: string; progress: number; fileId: string }[] = [];
  public baseUrl: string = environment.apiUrl.slice(0, -3);
  public tempNewClientList: any[] = [];
  public tempGroupMembers: any[] = [];
  public selectedGroupMembers: number[] = [];
  private existsGroupMembersId: number[] = [];
  public groupData = {
    allClints: [],
    groupAdmin: {},
    groupMembers: [],
    newMembres: [],
  };
  imageFilesToCrop: File[] = [];
  croppedImageBlobs: Blob[] = [];
  currentImageIndex: number = 0;
  showCropper: boolean = false;
  croppedEvent: any;
  regionResponse: any;
  nonImageFiles: any[] = [];
  localDisplayTime: any
  imageChangedEvent: any;
  public croppedFile: any;
  public previewUrl: SafeUrl = '';
  public isCropperVisible: boolean = false;



  constructor(
    private chatService: ChatSocketService,
    private cookie: CookieService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private sanitizer: DomSanitizer,
    private commonService: CommonService) { }

  ngOnInit(): void {
    debugger


    this.listenMessageSeen();
    this.receiverData['name'] = 'Unknown User';
  }



  ngOnChanges(changes: SimpleChanges): void {
    if (changes['receiverData']) {
      if (this.receiverData && Object.keys(this.receiverData).length > 0) {
        this.chatGroupId = this.receiverData.isGroup ? 'GROUP-' + this.receiverData.id : '';
        this.resetPageData();
        this.loadData();
        if (this.receiverData.isGroup) {
          this.groupData.allClints = this.receiverData.clientList;
          this.groupData.groupAdmin = this.groupData.allClints.find((x: any) => x.isGroupAdmin) ?? {};
          setTimeout(async () => {
            await this.loadGroupMembers();
            this.groupData.newMembres = this.groupData?.allClints?.filter((x: any) => !this.existsGroupMembersId.includes(x.id));
            this.tempNewClientList = this.groupData?.newMembres;
          }, 0);

        };
      }
    }
    if (changes['newChat']) {
      if (this.newChat && Object.keys(this.newChat).length > 0) {
        this.chatList.push(this.newChat);
        setTimeout(() => this.scrollToBottom(), 0);
      }
    }
  }

  toggleUpload = () => {
    this.isCropperVisible = !this.isCropperVisible;
    if (!this.isCropperVisible) {
      this.previewUrl = '';
      this.imageChangedEvent = null;
    }
  }
  async loadGroupMembers(): Promise<void> {
    this.spinner.show();
    try {
      const response = await this.chatService.loadGroupMembers(this.receiverData.id).toPromise();
      if (response?.message) {
        this.groupData.groupMembers = response.result;
        this.tempGroupMembers = this.groupData?.groupMembers;
        this.existsGroupMembersId = response.result.map((x: any) => x.groupMemberId);
      }
    } catch (err: any) {
      this.toastr.error(err.message || 'An error occurred while loading group members.');
    } finally {
      setTimeout(() => {
        this.spinner.hide();
      }, 300);
    }
  }

  filterGroupMember(searchText: string) {
    this.tempGroupMembers = this.groupData.groupMembers.filter((x: any) =>
      x.groupMemberName.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  filterNewMembers(searchText: string) {
    this.tempNewClientList = this.groupData.allClints.filter((x: any) =>
      !this.existsGroupMembersId.includes(x.id) && x.name.toLowerCase().includes(searchText.toLocaleLowerCase())
    );
  }


  downloadFileAsBlob(fileUrl: string): void {
    fetch(this.baseUrl + fileUrl)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then(blob => {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = fileUrl.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download failed:', error));
  }


  formatFileSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  }



  removeFile(index: number): void {
    const fileToRemove = this.filesToUpload[index];
    this.filesToUpload.splice(index, 1);
    this.uploadedFiles.splice(index, 1);
    this.chatService.cancelUpload(fileToRemove.fileId);
    this.chatService.deleteChunkFiles(fileToRemove.type, fileToRemove.name, fileToRemove.fileId).subscribe({
      next: (response) => {

      }
    });
  }

  onSelectGroupMember(Id: number) {
    if (!this.selectedGroupMembers.includes(Id)) {
      this.selectedGroupMembers.push(Id);
    } else {
      const index = this.selectedGroupMembers.findIndex((memberId) => memberId === Id);
      if (index !== -1) {
        this.selectedGroupMembers.splice(index, 1);
      }
    }
  }
  onAddGroupMember() {
    if (this.selectedGroupMembers.length) {
      this.spinner.show()
      this.chatService.addGroupMembers({ groupId: this.receiverData.id, groupMemberId: this.selectedGroupMembers }).subscribe({
        next: (response) => {
          if (response.message === 'Success') {
            setTimeout(async () => {
              await this.loadGroupMembers();
              this.tempNewClientList = this.groupData.allClints.filter((x: any) => !this.existsGroupMembersId.includes(x.id));
            }, 0);
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Group members were added successfully.',
              confirmButtonText: 'OK',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: response.message,
              confirmButtonText: 'OK',
            });
          };
          $('#show-user').modal('hide');
          setTimeout(() => this.spinner.hide(), 200)
        }, error: (err) => {
          this.spinner.hide();
          this.toastr.error(err.message);
        }
      })
    }
  }



  fileChangeEvent(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image',
          text: 'Please select a valid image file.',
          confirmButtonText: 'OK',
        }); return;
      };
      this.toggleUpload();
      this.imageChangedEvent = event;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    const blob: any = event.blob;
    this.croppedFile = new File([blob], 'cropped-image.png', { type: 'image/png' });
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(event.objectUrl ?? '');
  }



  onUploadProfile() {
    if (!this.croppedFile) {
      console.error('No cropped image available to upload');
      return;
    }

    this.spinner.show();
    const formData = this.createFormData();

    this.commonService.uploadImages(formData).subscribe({
      next: (response) => this.handleImageUploadSuccess(response),
      error: (err) => this.handleError(err)
    });
  }

  createFormData(): FormData {
    const formData = new FormData();
    formData.append('files', this.croppedFile, 'profile-image.jpg');
    formData.append('type', 'Profile_Image');
    return formData;
  }

  handleImageUploadSuccess(response: any): void {
    if (response.message === 'OK') {
      this.updateProfileImage(response);
    } else {
      this.toastr.error('Failed to upload image');
      this.spinner.hide();
    }
  }

  updateProfileImage(response: any): void {
    const documentList = this.createDocumentList(response.result[0]);
    this.commonService.manageMasterDocument(documentList).subscribe({
      next: (res) => this.handleDocumentUpdateSuccess(res),
      error: (err) => this.handleError(err)
    });
  }

  createDocumentList(result: any): any[] {
    return [{
      id: 0,
      referenceTableID: this.receiverData.id,
      referenceTableName: 'ChatGroup',
      documentTypeID: 4,
      documentImage: result.imageName,
      documentImagePath: result.path,
      loginUserID: this.senderId
    }];
  }

  handleDocumentUpdateSuccess(response: any): void {
    this.toastr.success('Document updated successfully!');
    this.toggleUpload();
    const document = response?.result?.added?.[0] || response?.result?.updated?.[0];
    if (document) {
      const mergeData = { ...document, groupId: this.receiverData.groupId };
      this.dataForParent.emit({ type: 'bind-logo', data: mergeData });
    }

    this.spinner.hide();
  }


  handleError(err: any): void {
    this.toastr.error(err.message);
    this.spinner.hide();
  }

  // async onFileSelected_Backup_22_07_2025(event: any): Promise<void> {
  //   const getMimeType = (contentType: string): string => {
  //     const normalizedContentType = contentType;
  //     if (normalizedContentType.startsWith('image/')) return 'image';
  //     if (normalizedContentType.startsWith('video/')) return normalizedContentType;
  //     if (normalizedContentType.startsWith('audio/')) return normalizedContentType;

  //     const documentTypes = [
  //       'application/pdf',
  //       'application/msword',
  //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //       'application/vnd.ms-excel',
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //       'application/vnd.ms-powerpoint',
  //       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  //       'application/zip',
  //       'application/x-rar-compressed',
  //       'application/x-7z-compressed',
  //       'text/plain',
  //       'application/json',
  //       'application/xml',
  //     ];

  //     if (documentTypes.includes(normalizedContentType)) {
  //       return `document_${normalizedContentType}`;
  //     }

  //     return 'unknown';

  //   };


  //   const makeFileNameUnique = (fileName: string): string => {
  //     const fileExtension = fileName.split('.').pop() || '';
  //     const baseName = fileName.replace(`.${fileExtension}`, '');
  //     const uniqueId = Date.now().toString();
  //     const maxBaseNameLength = 255 - (uniqueId.length + fileExtension.length + 2);
  //     const truncatedBaseName = baseName.slice(0, maxBaseNameLength);
  //     return `${truncatedBaseName}_${uniqueId}.${fileExtension}`;
  //   };

  //   const files: File[] = Array.from(event.target.files);
  //   this.filesToUpload = files.map((file: File, index: number) => {
  //     const mimeType = file.type.toLowerCase();
  //     const fileType = getMimeType(mimeType);



  //     return {
  //       file,
  //       status: 'pending',
  //       progress: 0,
  //       name: makeFileNameUnique(file.name),
  //       size: file.size,
  //       type: fileType,
  //       fileId: `${Date.now().toString()}_${index}`,
  //     };
  //   });
  //   this.uploadFile();
  // }



  onImageCropped(event: ImageCroppedEvent) {
    this.croppedEvent = event;
  }



  // method 1

  //commented on 13/08/25
  // async onFileSelected(event: any): Promise<void> {
  //   const getMimeType = (contentType: string): string => {
  //     const normalizedContentType = contentType;
  //     if (normalizedContentType.startsWith('image/')) return 'image';
  //     if (normalizedContentType.startsWith('video/')) return normalizedContentType;
  //     if (normalizedContentType.startsWith('audio/')) return normalizedContentType;

  //     const documentTypes = [
  //       'application/pdf',
  //       'application/msword',
  //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  //       'application/vnd.ms-excel',
  //       'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  //       'application/vnd.ms-powerpoint',
  //       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  //       'application/zip',
  //       'application/x-rar-compressed',
  //       'application/x-7z-compressed',
  //       'text/plain',
  //       'application/json',
  //       'application/xml',
  //     ];

  //     if (documentTypes.includes(normalizedContentType)) {
  //       return `document_${normalizedContentType}`;
  //     }
  //     return 'unknown';

  //   };


  //   const makeFileNameUnique = (fileName: string): string => {
  //     const fileExtension = fileName.split('.').pop() || '';
  //     const baseName = fileName.replace(`.${fileExtension}`, '');
  //     const uniqueId = Date.now().toString();
  //     const maxBaseNameLength = 255 - (uniqueId.length + fileExtension.length + 2);
  //     const truncatedBaseName = baseName.slice(0, maxBaseNameLength);
  //     return `${truncatedBaseName}_${uniqueId}.${fileExtension}`;
  //   };

  //   this.imageFilesToCrop = [];
  //   this.nonImageFiles = [];

  //   const files: File[] = Array.from(event.target.files);

  //   files.forEach((file, index) => {
  //     const mimeType = file.type.toLowerCase();
  //     const fileType = getMimeType(mimeType);

  //     if (fileType === 'image') {
  //       this.imageFilesToCrop.push(file);
  //     }
  //     else {
  //       this.nonImageFiles.push({
  //         file,
  //         status: 'pending',
  //         progress: 0,
  //         name: makeFileNameUnique(file.name),
  //         size: file.size,
  //         type: fileType,
  //         fileId: `${Date.now().toString()}_${index}`
  //       })
  //     }
  //   });

  //   if (this.imageFilesToCrop.length > 0) {
  //     this.startCroppingImages();
  //   }
  //   else {
  //     this.filesToUpload = this.nonImageFiles;
  //     this.uploadFile();
  //   }
  // }


  //Added on 13/08/25
  async onFileSelected(event: any): Promise<void> {
    const getMimeType = (contentType: string): string => {
      const normalizedContentType = contentType;
      if (normalizedContentType.startsWith('image/')) return 'image';
      if (normalizedContentType.startsWith('video/')) return normalizedContentType;
      if (normalizedContentType.startsWith('audio/')) return normalizedContentType;

      const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'text/plain',
        'application/json',
        'application/xml',
      ];

      if (documentTypes.includes(normalizedContentType)) {
        return `document_${normalizedContentType}`;
      }
      return 'unknown';
    };

    const makeFileNameUnique = (fileName: string): string => {
      const fileExtension = fileName.split('.').pop() || '';
      const baseName = fileName.replace(`.${fileExtension}`, '');
      const uniqueId = Date.now().toString();
      const maxBaseNameLength = 255 - (uniqueId.length + fileExtension.length + 2);
      const truncatedBaseName = baseName.slice(0, maxBaseNameLength);
      return `${truncatedBaseName}_${uniqueId}.${fileExtension}`;
    };

    this.imageFilesToCrop = [];
    this.nonImageFiles = [];

    const files: File[] = Array.from(event.target.files);

    const maxFileSizeMB = 45; // 45 MB
    const maxFileSizeBytes = maxFileSizeMB * 1024 * 1024;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      // ✅ Size validation
      if (file.size > maxFileSizeBytes) {
        Swal.fire({
          icon: 'error',
          title: 'File too large',
          text: `The file "${file.name}" exceeds the 45 MB limit.`,
          confirmButtonText: 'OK',
        });
        continue; // Skip this file
      }

      const mimeType = file.type.toLowerCase();
      const fileType = getMimeType(mimeType);

      if (fileType === 'image') {
        this.imageFilesToCrop.push(file);
      } else {
        this.nonImageFiles.push({
          file,
          status: 'pending',
          progress: 0,
          name: makeFileNameUnique(file.name),
          size: file.size,
          type: fileType,
          fileId: `${Date.now().toString()}_${index}`
        });
      }
    }

    if (this.imageFilesToCrop.length > 0) {
      this.startCroppingImages();
    } else {
      this.filesToUpload = this.nonImageFiles;
      this.uploadFile();
    }
  }

  // method 2 if have images

  startCroppingImages() {
    this.currentImageIndex = 0;
    this.cropNextImage();
  }

  // method 3
  cropNextImage() {
    const dataTransfer = new DataTransfer();
    if (this.currentImageIndex < this.imageFilesToCrop.length) {
      const file = this.imageFilesToCrop[this.currentImageIndex];
      dataTransfer.items.add(file);
      this.imageChangedEvent = { target: { files: dataTransfer.files } };
      // this.showCropper = true;

      $('#cropperModal').modal('show');

    } else {
      this.finalizeUploadPreparation();
    }
  }


  makeFileNameUnique(fileName: string) {
    const fileExtension = fileName.split('.').pop() || '';
    const baseName = fileName.replace(`.${fileExtension}`, '');
    const uniqueId = Date.now().toString();
    const maxBaseNameLength = 255 - (uniqueId.length + fileExtension.length + 2);
    const truncatedBaseName = baseName.slice(0, maxBaseNameLength);
    return `${truncatedBaseName}_${uniqueId}.${fileExtension}`;
  }


  onCropConfirmed() {
    const originalFile = this.imageFilesToCrop[this.currentImageIndex];
    const blob = this.croppedEvent.blob;

    const uniqueName = this.makeFileNameUnique(originalFile.name);

    const croppedFile = new File([blob], uniqueName, { type: blob.type });

    this.nonImageFiles.push({
      file: croppedFile,
      status: 'pending',
      progress: 0,
      name: uniqueName,
      size: croppedFile.size,
      type: 'image',
      fileId: `${Date.now().toString()}_${this.currentImageIndex}`,
    });

    this.currentImageIndex++;
    this.showCropper = false;
    this.cropNextImage();
  }

  // method 4 if images are finished to be cropped
  finalizeUploadPreparation() {
    this.filesToUpload = this.nonImageFiles;
    this.uploadFile(); // existing method
  }





  get profileImage(): string | SafeUrl {
    if (this.previewUrl) {
      return this.previewUrl;
    }

    if (this.receiverData?.fileUrl) {
      return this.baseUrl + this.receiverData.fileUrl;
    }

    return this.receiverData?.isGroup
      ? 'assets/img/dummy-group-icon.png'
      : 'assets/img/dummy-avatar.jpg';
  }


  resetAttachment() {
    $('#attachment').val('');
  }


  // async uploadFile(chunkSize: number = 1024 * 1024): Promise<void> {
  //   for (const fileData of this.filesToUpload) {
  //     const processFileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
  //     if (processFileIndex !== -1) {
  //       this.filesToUpload[processFileIndex].status = 'uploading';
  //     } 
  //     const totalChunks = Math.ceil(fileData.size / chunkSize);
  //     try {
  //       let finalResponse: any = null;
  //       for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
  //         const start = chunkIndex * chunkSize;
  //         const end = Math.min(fileData.size, start + chunkSize);
  //         const chunk = fileData.file.slice(start, end);

  //         const uploadResponse = await lastValueFrom(this.chatService.uploadChunk(fileData.fileId, fileData.name, chunk, chunkIndex, totalChunks, fileData.type));
  //         if (chunkIndex === totalChunks - 1) {
  //           finalResponse = uploadResponse;
  //         }

  //         const fileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
  //         if (fileIndex !== -1) {
  //           this.filesToUpload[fileIndex].progress = Math.round(
  //             ((chunkIndex + 1) / totalChunks) * 100
  //           );
  //         }
  //       }

  //       const completedFileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
  //       if (completedFileIndex !== -1) {
  //         this.filesToUpload[completedFileIndex].status = 'completed';
  //       };

  //       this.uploadedFiles.push({ fileName: finalResponse.result.fileName, fileUrl: finalResponse.result.url, fileType: finalResponse.result.fileType })

  //     } catch (error) {
  //       console.error(`Error uploading file: ${fileData.name}`, error);

  //       const failedFileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
  //       if (failedFileIndex !== -1) {
  //         this.filesToUpload[failedFileIndex].status = 'failed';
  //       }
  //     }
  //   }
  // }


  // mohit

  async uploadFile(chunkSize: number = 1024 * 1024): Promise<void> {
    // mohit
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];

    let imageCount = 0;
    let totalVideoSizeMB = 0;

    for (let i = 0; i < this.filesToUpload.length; i++) {
      const fileObj = this.filesToUpload[i];
      const file = fileObj.file;

      if (allowedImageTypes.includes(file.type)) {
        if (imageCount >= 10) {
          await Swal.fire({
            icon: 'warning',
            title: 'Maximum 10 Images Allowed',
            text: `Skipping ${file.name}: maximum 10 images are allowed.`,
            confirmButtonText: 'OK',
          });
          this.filesToUpload.splice(i, 1);
          i--;
          continue;
        }

        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 900,
          useWebWorker: true,
        });

        fileObj.file = compressedFile;
        fileObj.size = compressedFile.size;
        imageCount++;

      }
      else if (allowedVideoTypes.includes(file.type)) {
        const sizeMB = file.size / (1024 * 1024);
        if ((totalVideoSizeMB + sizeMB) > 50) {
          await Swal.fire({
            icon: 'warning',
            title: 'Video Size Limit Exceeded',
            text: `Total video size exceeds the 50 MB limit. Please reduce the video size.`,
            confirmButtonText: 'OK',
          });
          this.filesToUpload.splice(i, 1);
          i--;
          continue;
        }
        totalVideoSizeMB += sizeMB;
      }
    }

    for (const fileData of this.filesToUpload) {
      const processFileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
      if (processFileIndex !== -1) {
        this.filesToUpload[processFileIndex].status = 'uploading';
      }

      const totalChunks = Math.ceil(fileData.size / chunkSize);

      try {
        let finalResponse: any = null;
        for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
          const start = chunkIndex * chunkSize;
          const end = Math.min(fileData.size, start + chunkSize);
          const chunk = fileData.file.slice(start, end);

          const uploadResponse = await lastValueFrom(
            this.chatService.uploadChunk(fileData.fileId, fileData.name, chunk, chunkIndex, totalChunks, fileData.type)
          );

          if (chunkIndex === totalChunks - 1) {
            finalResponse = uploadResponse;
          }

          const fileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
          if (fileIndex !== -1) {
            this.filesToUpload[fileIndex].progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
          }
        }

        const completedFileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
        if (completedFileIndex !== -1) {
          this.filesToUpload[completedFileIndex].status = 'completed';
        }

        this.uploadedFiles.push({
          fileName: finalResponse.result.fileName,
          fileUrl: finalResponse.result.url,
          fileType: finalResponse.result.fileType,
        });

      } catch (error) {
        console.error(`Error uploading file: ${fileData.name}`, error);

        const failedFileIndex = this.filesToUpload.findIndex(f => f.fileId === fileData.fileId);
        if (failedFileIndex !== -1) {
          this.filesToUpload[failedFileIndex].status = 'failed';
        }
      }
    }
    $('#cropperModal').modal('hide');

  }



  // async uploadFile(files: any[]): Promise<void> {
  //   const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  //   const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
  //   const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

  //   let imageCount = 0;
  //   let totalVideoSizeMB = 0;
  //   const maxFileSizeMB = 50; // per file limit

  //   // 1️⃣ Validation + compression (same as before)
  //   for (let i = 0; i < files.length; i++) {
  //     const fileObj = files[i];
  //     let file = fileObj.file;

  //     // File type validation
  //     if (
  //       !allowedImageTypes.includes(file.type) &&
  //       !allowedVideoTypes.includes(file.type) &&
  //       !allowedAudioTypes.includes(file.type)
  //     ) {
  //       await Swal.fire({
  //         icon: 'error',
  //         title: 'Unsupported File Type',
  //         text: `${file.name} is not supported.`,
  //         confirmButtonText: 'OK',
  //       });
  //       files.splice(i, 1);
  //       i--;
  //       continue;
  //     }

  //     // Per file size check
  //     if (file.size / (1024 * 1024) > maxFileSizeMB) {
  //       await Swal.fire({
  //         icon: 'warning',
  //         title: 'File Too Large',
  //         text: `${file.name} exceeds the ${maxFileSizeMB}MB limit.`,
  //         confirmButtonText: 'OK',
  //       });
  //       files.splice(i, 1);
  //       i--;
  //       continue;
  //     }

  //     // Image limit check + compression
  //     if (allowedImageTypes.includes(file.type)) {
  //       if (imageCount >= 10) {
  //         await Swal.fire({
  //           icon: 'warning',
  //           title: 'Maximum 10 Images Allowed',
  //           text: `Skipping ${file.name}: maximum 10 images are allowed.`,
  //           confirmButtonText: 'OK',
  //         });
  //         files.splice(i, 1);
  //         i--;
  //         continue;
  //       }

  //       const compressedFile = await imageCompression(file, {
  //         maxSizeMB: 1,
  //         maxWidthOrHeight: 900,
  //         useWebWorker: true,
  //       });

  //       fileObj.file = compressedFile;
  //       fileObj.size = compressedFile.size;
  //       imageCount++;
  //     }
  //     // Video total size check
  //     else if (allowedVideoTypes.includes(file.type)) {
  //       const sizeMB = file.size / (1024 * 1024);
  //       if ((totalVideoSizeMB + sizeMB) > 50) {
  //         await Swal.fire({
  //           icon: 'warning',
  //           title: 'Video Size Limit Exceeded',
  //           text: `Total video size exceeds the 50 MB limit.`,
  //           confirmButtonText: 'OK',
  //         });
  //         files.splice(i, 1);
  //         i--;
  //         continue;
  //       }
  //       totalVideoSizeMB += sizeMB;
  //     }
  //   }

  //   // 2️⃣ Direct full file upload (no chunks)
  //   for (const fileData of files) {
  //     try {
  //       fileData.status = 'uploading';
  //       this.spinner.show();

  //       this.chatService.uploadFile(fileData.fileId, fileData.file, fileData.type).subscribe({
  //         next: (response: any) => {
  //           fileData.status = 'completed';

  //           // Push to uploadedFiles so sendMessage() works
  //           this.uploadedFiles.push({
  //             fileName: response.result.fileName,
  //             fileUrl: response.result.url,
  //             fileType: response.result.fileType,
  //           });

  //           this.spinner.hide();
  //         },
  //         error: (error) => {
  //           console.error('Upload error:', error);
  //           fileData.status = 'failed';
  //           this.spinner.hide();
  //         }
  //       });

  //     } catch (error) {
  //       console.error('Unexpected error:', error);
  //       fileData.status = 'failed';
  //       this.spinner.hide();
  //     }
  //   }
  // }



  getFileIconClass(fileType: string): string {

    if (fileType.startsWith('document')) {
      fileType = fileType.replace('document_', '');
    };
    switch (fileType) {
      case 'application/pdf':
        return 'fa-file-pdf';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'fa-file-word';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'fa-file-excel';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'fa-file-powerpoint';

      case 'image':
        return 'fa-file-image';
      case 'video/mp4':
      case 'video/x-matroska':
      case 'video/avi':
      case 'video/webm':
        return 'fa-file-video';

      // Audio types
      case 'audio/mpeg':
      case 'audio/ogg':
      case 'audio/wav':
      case 'audio/x-wav':
        return 'fa-file-audio';


      case 'text/plain':
        return 'fa-file-alt';
      case 'application/zip':
      case 'application/x-rar-compressed':
      case 'application/x-7z-compressed':
        return 'fa-file-archive';
      default:
        return 'fa-file';
    }
  }

  getFileIconColor(fileType: string): string {
    if (fileType.startsWith('document')) {
      fileType = fileType.split('_')[1];
    };
    switch (fileType) {
      case 'application/pdf':
        return '#de2429';
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '#2a5699';
      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '#1d6f42';
      case 'application/vnd.ms-powerpoint':
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return '#d24726';
      case 'image':
        return '#3b5998';


      case 'video/mp4':
      case 'video/x-matroska':
      case 'video/avi':
      case 'video/webm':
        return '#1e90ff';

      // Audio types
      case 'audio/mpeg':
      case 'audio/ogg':
      case 'audio/wav':
      case 'audio/x-wav':
        return '#8a2be2';


      case 'text/plain':
        return '#333333';
      case 'application/zip':
      case 'application/x-rar-compressed':
      case 'application/x-7z-compressed':
        return '#f0ad4e';
      default:
        return '#6c757d';
    }
  }


  resetPageData = () => {
    this.isReachedLast = false;
    this.chatList = [];
    this.pageIndex = 1;
  }

  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any): void {
    this.messageToSend += event.emoji.native;
    this.showEmojiPicker = false;
  }

  toggleLoading = () => this.isLoading = !this.isLoading;

  scrollToBottom(): void {
    const container = this.scrollContainer.nativeElement;
    this.isScrollingManually = true;
    container.scrollTop = container.scrollHeight;
    setTimeout(() => {
      this.isScrollingManually = false;
    }, 50);
  }
  preserveScrollPosition(prevScrollHeight: number): void {
    const container = this.scrollContainer.nativeElement;
    const currentScrollHeight = container.scrollHeight;
    container.scrollTop = currentScrollHeight - prevScrollHeight;
  }


  private listenMessageSeen() {
    this.chatService.getMessagesSeen().subscribe((receiverId: number) => {
      if (this.receiverData.receiverId === receiverId) {
        this.updateMessageStatus(receiverId);
      }
    });
  }

  updateMessageStatus(receiverId: number): void {
    const senderChats = this.chatList.filter(x => x.type === 'sender' && x.data.receiverId === receiverId && !x.data.isRead);
    senderChats.forEach(x => x.data.isRead = true);
  }

  //Commented on 12/08/25
  // loadData = () => {
  //   this.toggleLoading();
  //   this.chatService.loadChat(this.senderId, this.receiverData.id, this.chatGroupId, this.pageIndex, this.pageSize).subscribe({
  //     next: (response) => {
  //       if (response.message === 'Success') {
  //         this.chatList = response.result.sort((a: any, b: any) => {
  //           return new Date(a.data.timestamp).getTime() - new Date(b.data.timestamp).getTime();
  //         });
  //         setTimeout(() => this.scrollToBottom(), 0);

  //       }
  //     },
  //     error: (err) => {
  //       this.toastr.error(err.message);
  //     },
  //     complete: () => this.toggleLoading()
  //   });
  // }

  //Added on 12/08/25
  loadData = (): void => {
    this.toggleLoading();



    let region = this.commonService.regionResponseSignal();
    // if (region.offsetString != '') {
    //   this.regionResponse = region;
    // }
    debugger
    this.chatService.loadChat(
      this.senderId,
      this.receiverData.id,
      this.chatGroupId,
      this.pageIndex,
      this.pageSize,
      region.offsetHours,
      region.offsetMinutes
    ).subscribe({
      next: async (response) => {
        if (response.message === 'Success') {
          const chatList = response.result.sort((a: any, b: any) => {
            return new Date(a.data.timestamp).getTime() - new Date(b.data.timestamp).getTime();
          });

          for (const chatItem of chatList) {
            if (chatItem.data?.chatFiles?.length) {
              for (const file of chatItem.data.chatFiles) {
                const ext = file.fileType?.startsWith('.') ? file.fileType : '.' + (file.fileType || 'bin');
                const mimeType = this.getMimeTypeFromExtension(ext);

                if (file.fileContentBase64) {
                  //Convert Base64 to Blob + URL
                  const fileData = await this.ConvertS3File(file.fileContentBase64, mimeType);
                  file.fileUrl = fileData.url;
                  file.fileBlob = fileData.blob;
                } else {
                  // No Base64 (large file) → direct link to S3 or API like video
                  file.fileUrl = `${this.baseUrl}${file.filePath}${file.fileName}`;
                  file.fileBlob = null;
                }
              }
            }
          }

          this.chatList = chatList;
          setTimeout(() => this.scrollToBottom(), 0);
        }
      },
      error: (err) => {
        this.toastr.error(err.message);
      },
      complete: () => this.toggleLoading()
    });
  }

  getMimeTypeFromExtension(ext: string): string {
    const map: any = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.mkv': 'video/x-matroska',
      '.webm': 'video/webm',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.ogg': 'audio/ogg',
      '.m4a': 'audio/mp4',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.txt': 'text/plain'
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }

  ConvertS3File(base64: string, mimeType: string = 'application/octet-stream') {
    const blob = this.base64ToBlob(base64, mimeType);
    const url = URL.createObjectURL(blob);
    return { url, blob };
  }

  base64ToBlob(base64: string, mime = 'application/octet-stream'): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = Array.from(slice).map((char) => char.charCodeAt(0));
      byteArrays.push(new Uint8Array(byteNumbers));
    }
    return new Blob(byteArrays, { type: mime });
  }

  // downloadFile(file: any) {
  //   let fileUrl: string = file.fileBlob
  //     ? URL.createObjectURL(file.fileBlob)
  //     : file.fileUrl;

  //   const a = document.createElement('a');
  //   a.href = fileUrl;
  //   a.download = this.getCleanFileName(file.fileName);
  //   a.click();
  // }

  downloadFile(file: any) {
    if (file.fileContentBase64) {
      // Base64 → Blob
      const byteCharacters = atob(file.fileContentBase64);
      const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: this.getMimeTypeFromExtension(file.fileType) });
      const url = URL.createObjectURL(blob);
      this.triggerDownload(url, file.fileName);
    } else if (file.fileUrl) {
      this.triggerDownload(file.fileUrl, file.fileName);
    }
  }

  triggerDownload(url: string, fileName: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }


  getCleanFileName(fileName: string): string {
    return fileName ? fileName.split('_').pop() || fileName : '';
  }

  downloadAndOpenFile(file: any) {
    let fileUrl: string = file.fileBlob
      ? URL.createObjectURL(file.fileBlob)
      : file.fileUrl;

    window.open(fileUrl, '_blank');
  }

  //Commented on 12/08/25
  // appendData = () => {
  //   if (this.isLoading) return;
  //   this.toggleLoading();
  //   const container = this.scrollContainer.nativeElement;
  //   const prevScrollHeight = container.scrollHeight;
  //   this.chatService.loadChat(this.senderId, this.receiverData.id, this.chatGroupId, this.pageIndex, this.pageSize).subscribe({
  //     next: (response) => {
  //       if (response.message === 'Success') {
  //         this.chatList = [...response.result, ...this.chatList];
  //         setTimeout(() => this.preserveScrollPosition(prevScrollHeight), 0);
  //       } else {
  //         this.isReachedLast = true;
  //       }
  //     },
  //     error: (err) => {
  //       this.toastr.error(err.message);
  //     },
  //     complete: () => this.toggleLoading()
  //   });
  // }

  appendData = () => {
    if (this.isLoading) return;
    this.toggleLoading();
    const container = this.scrollContainer.nativeElement;
    const prevScrollHeight = container.scrollHeight;
    let region = this.commonService.regionResponseSignal();
    if (region.offsetString != '') {
      this.regionResponse = region;
    }

    this.chatService.loadChat(this.senderId, this.receiverData.id, this.chatGroupId, this.pageIndex, this.pageSize, this.regionResponse.offsetHours,
      this.regionResponse.offsetMinutes).subscribe({
        next: async (response) => {
          if (response.message === 'Success') {
            const newChats = response.result.sort((a: any, b: any) => {
              return new Date(a.data.timestamp).getTime() - new Date(b.data.timestamp).getTime();
            });

            for (const chatItem of newChats) {
              if (chatItem.data?.chatFiles?.length) {
                for (const file of chatItem.data.chatFiles) {
                  const ext = file.fileType?.startsWith('.') ? file.fileType : '.' + (file.fileType || 'bin');
                  const mimeType = this.getMimeTypeFromExtension(ext);

                  if (file.fileContentBase64) {
                    const fileData = await this.ConvertS3File(file.fileContentBase64, mimeType);
                    file.fileUrl = fileData.url;
                    file.fileBlob = fileData.blob;
                  } else {
                    file.fileUrl = `${this.baseUrl}${file.filePath}${file.fileName}`;
                    file.fileBlob = null;
                  }
                }
              }
            }

            this.chatList = [...newChats, ...this.chatList];
            setTimeout(() => this.preserveScrollPosition(prevScrollHeight), 0);
          } else {
            this.isReachedLast = true;
          }
        },
        error: (err) => {
          this.toastr.error(err.message);
        },
        complete: () => this.toggleLoading()
      });
  }

  onScroll = () => {
    if (this.isScrollingManually || this.isReachedLast) {
      return;
    };
    const container = this.scrollContainer.nativeElement;
    if (container.scrollTop <= 0) {
      this.pageIndex++;
      this.appendData();
    }
  }

  // sendMessage(): void {
  //   debugger
  //   let region = this.commonService.regionResponseSignal();
  //   if (region.offsetString != "") {
  //     this.regionResponse = region;
  //   }

  //   if ((this.messageToSend.trim() || this.uploadedFiles.length) && !this.inProcessFileUploading()) {
  //     // const timestamp = new Date().toISOString()// frontend local time

  //     const timestamp = new Date();
  //     if (this.receiverData.isGroup) {
  //       const payload = { senderId: this.senderId, receiverId: 0, message: this.messageToSend, timestamp, chatFiles: this.uploadedFiles, chatRoomId: `GROUP-${this.receiverData.id}` };
  //       this.chatService.sendGroupMessage(payload);
  //     } else {
  //       const payload = { senderId: this.senderId, receiverId: this.receiverData.id, message: this.messageToSend, timestamp, chatFiles: this.uploadedFiles, regionHours: this.regionResponse.offsetHours, regionMinutes: this.regionResponse.offsetMinutes };
  //       this.chatService.sendMessage(payload);
  //     }
  //     this.messageToSend = '';
  //     this.filesToUpload = [];
  //     this.uploadedFiles = [];
  //   } else {
  //   }
  // }

  inProcessFileUploading(): boolean {
    return this.filesToUpload.some(x => x.progress < 100);
  }



  sendMessage(): void {

    if ((this.messageToSend.trim() || this.uploadedFiles.length) && !this.inProcessFileUploading()) {

      const timestamp = new Date();  // user’s local time

      const payload = {
        senderId: this.senderId,
        receiverId: this.receiverData.isGroup ? 0 : this.receiverData.id,
        message: this.messageToSend,
        timestamp: timestamp,
        chatFiles: this.uploadedFiles,
        chatRoomId: this.receiverData.isGroup ? `GROUP-${this.receiverData.id}` : null,
      };


      // const localMessage = {
      //   id: 0,                        // temporary (API will generate real ID)
      //   isRead: false,
      //   messageType: "text",
      //   senderId: this.senderId,
      //   receiverId: this.receiverData.id,
      //   senderName: 'vendor', // if you store senderName
      //   data: {
      //     message: this.messageToSend,
      //     timestamp: timestamp.toISOString(), // API-like format
      //     chatFiles: this.uploadedFiles,
      //     chatRoomId: this.receiverData.isGroup ? `GROUP-${this.receiverData.id}` : null,
      //     senderId: this.senderId,
      //     receiverId: this.receiverData.id,
      //     messageType: "text",
      //     isRead: false,
      //     regionHours: this.regionResponse.offsetHours,
      //     regionMinutes: this.regionResponse.offsetMinutes
      //   }
      // };

      // debugger
      // this.chatList.push(localMessage);


      console.log('Sending message payload:', payload);
      if (this.receiverData.isGroup) {
        this.chatService.sendGroupMessage(payload);
      } else {
        this.chatService.sendMessage(payload);
      }


      this.scrollToBottom();
      this.messageToSend = '';
      this.filesToUpload = [];
      this.uploadedFiles = [];


    }

  }

}
