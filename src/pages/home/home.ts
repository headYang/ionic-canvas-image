import { Component, ViewChild } from '@angular/core';
import { NavController, Content, Platform, normalizeURL } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';

const STORAGE_KEY = 'IMAGE_LIST';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  selectedColor = '#111111';
  colors = ['#111111', '#555555', '#888888', '#dddddd'];

  @ViewChild('imageCanvas') canvas: any;
  canvasElement: any;

  saveX: number;
  saveY: number;

  storeImage = [];

  @ViewChild(Content) content: Content;
  @ViewChild('fixedContainer') fixedContainer: any; 
  constructor(public navCtrl: NavController, private storage: Storage, private plt: Platform, private file: File) {
    this.storage.ready().then(() =>{
      this.storage.get(STORAGE_KEY).then((data) => {
        if(data) {
          this.storeImage = data;
        }
      });
    });
  }

  ionViewDidEnter() {
    let itemHeight = this.fixedContainer.nativeElement.offsetHeight;
    let scroll = this.content.getScrollElement();

    itemHeight = Number.parseFloat(scroll.style.marginTop.replace("px", "")) + itemHeight;
    scroll.style.marginTop = itemHeight + 'px';
  }
  ionViewDidLoad() {
    this.canvasElement = this.canvas.nativeElement;
    this.canvasElement.width = this.plt.width() + '';
    this.canvasElement.height = 200;
  }

  startDraw(ev) {
    var canvasposition = this.canvasElement.getBoundingClientRect();
    this.saveX = ev.touches[0].pageX - canvasposition.x;
    this.saveY = ev.touches[0].pageY - canvasposition.y;
  }
  move(ev) {
    var canvasposition = this.canvasElement.getBoundingClientRect();
    let currentX = ev.touches[0].pageX - canvasposition.x;
    let currentY = ev.touches[0].pageY - canvasposition.y; 

    let ctx = this.canvasElement.getContext('2d');
    ctx.lineJoin = 'round';
    ctx.strokeStyle =  this.selectedColor;
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(this.saveX, this.saveY);
    ctx.lineTo(currentX, currentY);
    ctx.closePath();
    ctx.stroke();

    this.saveX = currentX;
    this.saveY = currentY;
  }
  selectColor(color) {
    this.selectedColor = color;
  }
  b64toBlob(b64Data, contentType) {
    contentType = contentType || '';
    var sliceSize =  512;
  
    var byteCharacters = atob(b64Data);
    var byteArrays = [];
  
    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
  
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      var byteArray = new Uint8Array(byteNumbers);
  
      byteArrays.push(byteArray);
    }
  
    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }


  saveCanvasImage() {
    var dataUrl = this.canvasElement.toDataURL();
    let ctx = this.canvasElement.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let name = new Date().getTime() + '.png';
    let path = this.file.dataDirectory;

    var data = dataUrl.split(',')[1];
    let blob = this.b64toBlob(data, 'image/png');
    
    this.file.writeFile(path, name, blob).then((res) => {
      this.storeImages(name);
    }, err => {
      console.log('err: ', err);
    })
  }

  storeImages(imageName) {
    let saveObj = { img: imageName };
    this.storeImage.push(saveObj);
    this.storage.set(STORAGE_KEY, this.storeImage).then(() => {
      setTimeout(() => {
        this.content.scrollToBottom();  
      }, 500);
      
    });
  }
  removeImage(index) {
    let removed = this.storeImage.splice(index, 1);
    this.file.removeFile(this.file.dataDirectory, removed[0].img).then((res) => {
      console.log('removed');
    }, err => {
      console.log('removed err');
    })
  }

  getImagepath(imagename) {
    let path = this.file.dataDirectory + imagename;
    path = normalizeURL(path);
    return path;
  }
}
