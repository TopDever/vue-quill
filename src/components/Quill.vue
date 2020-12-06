<template>
    <div class="v-alert quill" :style="{ top: top+'px', left: left+'px', width: width+'px', height: height+'px', marginLeft: '0px' }">
        <header @mousedown="startMove($event)" style="border-bottom: 1px solid #c0c0c0"><p>Quill Editor</p><div class="x" @click="exit"></div></header>
        
        <div id="standalone-container">
            <div id="toolbar-container">
                <span class="ql-formats">
                <select class="ql-font">
                    <option v-for="val in fontValues" :value="val.name" :key="val.name">{{val.label}}</option>
                </select>
                <select class="ql-size">
                    <option value="10px">10</option>
                    <option value="12px">12</option>
                    <option value="14px">14</option>
                    <option value="16px">16</option>
                    <option value="18px">18</option>
                </select>
                </span>
                
                <span class="ql-formats">
                    <button class="ql-bold"></button>
                    <button class="ql-italic"></button>
                    <button class="ql-underline"></button>
                    <button class="ql-strike"></button>
                </span>
                <span class="ql-formats">
                <select class="ql-color"></select>
                <select class="ql-background"></select>
                </span>
                <span class="ql-formats">
                <button class="ql-blockquote"></button>
                <button class="ql-code-block"></button>
                <button class="ql-link"></button>
                </span>
                <span class="ql-formats">
                <button class="ql-header" value="1"></button>
                <button class="ql-header" value="2"></button>
                </span>
                <span class="ql-formats">
                <button class="ql-list" value="ordered"></button>
                <button class="ql-list" value="bullet"></button>
                <button class="ql-indent" value="-1"></button>
                <button class="ql-indent" value="+1"></button>
                </span>
                <span class="ql-formats">
                <button class="ql-direction" value="rtl"></button>
                <select class="ql-align"></select>
                </span>
                <span class="ql-formats">
                <button class="ql-script" value="sub"></button>
                <button class="ql-script" value="super"></button>
                </span>
                <span class="ql-formats">
                <button class="ql-clean"></button>
                </span>
            </div>
        </div>
        <div class="quill-container">
            <div id="editor"></div>
            <div class="btns">
                <p class="btn" @click="save">save</p>
                
            </div>
        </div>
        <ul>
    </ul>
    </div>
</template>

<script>

import Alert from '@/utils/Alert.js'
import Quill from 'quill'
import UploadFile from '../utils/UploadFile.js'
import postMinify from '../utils/postMinify.js'

export default {
    props: ['item', 'selectedFont'],
    data () {
        return {
            top: 100,
            left: 400,
            height: 600,
            width: 800,
            html: '',
            updatedHtml: '',
            quill: '',
            fontValues: [
                {name:'', label:"Sans Serif"}, 
                {name:'inconsolata', label:"Inconsolata"}, 
                {name:'roboto', label:"Roboto"}, 
                {name:'mirza', label:"Mirza"}, 
                {name:'arial', label:"Arial"}, 
                {name:'tangerine', label:"Tangerine"}, 
                {name:'impact', label:"Impact"},
                {name:'solway', label:'Solway'},
                {name:'rancho', label:'Rancho'},
                {name:'sedgwickave', label:'Sedgwick Ave'},
            ] 
        }
    },
    beforeDestroy () {
        this.stopListen();
    },
    mounted () {
        this.left = window.innerWidth - 300;
        this.startListen();
        this.updatedHtml = this.html = this.item.html;
        console.log('Quill this.item',this.item);
        var style = document.querySelector('head #quill');
        if ( !style ) {
            style = document.createElement('link');
            style.setAttribute('href','https://cdn.quilljs.com/1.0.0/quill.snow.css');
            style.setAttribute('id','quill');
            style.setAttribute('rel','stylesheet');
            document.head.appendChild(style);
        }
        this.initQuill();
    },
    computed: {
        fonts: function() {
            return this.fontValues
        }
    },
    watch: {
        selectedFont(curFont){
            this.quill.format('font', curFont)
        }
    },
    methods: {
        initQuill () {
           
            // Add fonts to whitelist
            let Font = Quill.import('formats/font');
            // We do not add Sans Serif since it is the default
            Font.whitelist = this.fontValues.map((font) => font.name);
            Quill.register(Font, true);
            var Size = Quill.import('attributors/style/size');
            Size.whitelist = ['10px', '12px', '14px', '16px', '18px'];
            Quill.register(Size, true);
            
            this.quill = new Quill(this.$el.querySelector('#editor'),{
                modules: {
                    toolbar: this.$el.querySelector('#toolbar-container')
                    // toolbar: [
                    //     [{ 'font': this.fonts }],
                    //     [{'size': []}],
                    //     [{ header: [1, 2, 3, 4, false] }],
                    //     ['bold', 'italic', 'underline'],
                    //     [{ 'align': null} , {'align': 'center'}, {'align': 'right'}, {'align': 'justify'}],
                    //     [{ 'color': ['#FF0000','#00FF00','#0000FF','#000000','#FFFFFF'] },{ 'background': ['#FF0000','#00FF00','#0000FF','#000000','#FFFFFF'] }],
                    //     [{ 'indent': '-1'}, { 'indent': '+1' }],
                    //     ['link'],
                    //     ['image'],
                    //     ['video']
                    // ]
                },
                theme: 'snow',
            });
            this.quill.getModule('toolbar').addHandler('image',() => { 
                var range = this.quill.getSelection();
                UploadFile(result => {
                    postMinify(result.result,resp => {
                        if ( resp.size ) return console.log('resp.size',resp.size);
                        if ( resp.progress ) { return console.log('progress',resp.progress) }
                        if ( resp.url ) {
                            this.quill.insertEmbed(range.index, 'image', resp.url);
                        }
                    })
                })                
            });
            this.quill.on('editor-change',() => this.updateHTML(this.quill.scrollingContainer.innerHTML));
            
            this.quill.scrollingContainer.innerHTML = this.item.html
        },
        updateHTML ( HTML ) {
            this.updatedHtml = HTML;
            this.$emit('emit',{ t: 'quill', action: 'updateHTML', HTML });
        },
        imageHandler ( image, cB ) {
            console.log('imageHandler',image);
            cB(image);
        },
        exit () {
            if ( this.updatedHtml != this.item.html ) {
                return Alert.yesno('Exit without saving Changes ?',yes => {
                    yes && this.$emit('exit');
                })
            }
            this.$emit('emit',{ t: 'quill', action: 'exit' });
        },
        save () {
            
            if ( this.updatedHtml == this.item.html ) return this.$emit('exit')
            this.item.save({ _id: this.item._id, html: this.updatedHtml });
        },
        startListen() {
            document.body.addEventListener('mousemove',this.move);
            document.body.addEventListener('mouseup',this.stop);
            document.body.addEventListener('mouseleave',this.stop);
        },
        stopListen () {
            document.body.removeEventListener('mousemove',this.move);
            document.body.removeEventListener('mouseup',this.stop);
            document.body.removeEventListener('mouseleave',this.stop);
        },
        startMove ( e ) {
            this.moving = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
        },
        move ( e ) {
            var { moving, sizing } = this;
            if ( !moving && !sizing ) return;
            e.preventDefault();
            var { startX, startY } = this;
            var { clientX, clientY } = e;
            if ( moving ) {
                this.top = this.top - ( startY - clientY );
                this.left = this.left - ( startX - clientX );
            } else {
                var width = this.width - ( startX - clientX )
                width > 420 && ( this.width = width );
                var height = this.height - ( startY - clientY );
                height > 276 && ( this.height = height );
            }
            this.startX = clientX;
            this.startY = clientY;
        },
        stop () {
            this.moving = false;
            this.sizing = false;
        },
        startSize ( e ) {
            this.sizing = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
        },
    }
}

</script>

<style lang="scss">
.v-alert.quill {
    width: calc(50% + 45px);
    margin-left: 240px;
    padding-bottom: 5px;
    top: 70px;
    z-index: 50000;
    position: fixed;
    header {
        width: 100%; float: left;
        p { font-size: 20px; }
    }    
    .quill-container {
        min-height: 290px;
        top: 5px;
        position: relative;
        float: left;
        width: 100%;
        #editor {
            width: calc(100% - 10px);
            height: 570px;
            margin: 5px;
            margin-top: 0px;
            strong { font-weight: bold !important; }
            strong * { font-weight: bold !important; }
            strong * * { font-weight: bold !important; }
        }
        .ql-toolbar {
            width: calc(100% - 10px);
            margin: 0px 5px;

        }
    }
}

  /* Set dropdown font-families */
  .ql-font span[data-label="Sans Serif"]::before {
    font-family: "Sans Serif";
  }
  
  .ql-font span[data-label="Inconsolata"]::before {
    font-family: "Inconsolata";
  }
  
  .ql-font span[data-label="Roboto"]::before {
    font-family: "Roboto";
  }
  
  .ql-font span[data-label="Mirza"]::before {
    font-family: "Mirza";
  }
  
  .ql-font span[data-label="Arial"]::before {
    font-family: "Arial";
  }
  
  .ql-font span[data-label="Tangerine"]::before {
    font-family: "Tangerine";
  }
  .ql-font span[data-label="Impact"]::before {
    font-family: "Impact";
  }
  .ql-font span[data-label="Rancho"]::before {
    font-family: "Rancho";
  }

  /* Set content font-families */
  
  .ql-font-inconsolata {
    font-family: "Inconsolata";
  }
  
  .ql-font-roboto {
    font-family: "Roboto";
  }
  
  .ql-font-mirza {
    font-family: "Mirza";
  }
  
  .ql-font-arial {
    font-family: "Arial";
  }
  .ql-font-tangerine {
    font-family: "Tangerine";
  }
  .ql-font-impact {
    font-family: "Impact"
  }
  .ql-font-rancho {
    font-family: "Rancho"
  }
    .ql-font{
        display: none !important;
    }
</style>