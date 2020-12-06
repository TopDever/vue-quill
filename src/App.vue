<template>
  <div id="app">
    <div class="view-btns">
			<p class="btn sm" v-for="view in views" @click="toggle(view)" :key="view">{{ view }}</p>
		</div>
    <div class="font-style-bar">
      <div class="label fonts-list">
				<p>Font Family</p>
				<div class="font-select" style="width: 394px;position: relative;">
					<div @click="showFontInput($event)">
						<input v-if="!selectedFontFamily" class="font-select-input" style="font-size: 20px;margin:5px 0px 5px 0px;width:100%" @keyup="filterFonts('keyup',$event)" @keydown="filterFonts('keydown',$event)" @focus="startShowFocus($event)" @blur="stopShowFontSearch()" />
						<img v-if="selectedFontFamily" :src="selectedFontFamily.src" style="margin:px 0px 5px 0px;padding:0px;position: absolute;top:0px;left:0px;border:1px solid black;background-color: white;padding-bottom:3px;padding-right:3px"  />
					</div>

					<div v-if="showFontSearch" style="border:1px solid #c0c0c0;position: absolute;top:34px;left:0px;width: 400px;max-height: calc(100vh - 68px);overflow-y: scroll;">
						<div v-for="(font,i) in fontFamilies.filter(f => f.selected)" :key="i" style="border-bottom: 1px solid #c0c0c0;background-color: white;z-index:150;position: relative;">
							<img :src="font.src" loading="lazy" :id="font._id" style="background-color: white" @click="selectFontFamily(font,$event)"/>
						</div>
					</div>
				</div>
      </div>
      <div class="label font-sizes"> 
        <p>Font Size</p>
        <select @change="configureFont('fontSize')" v-model="font.fontSize"><option v-for="(fontSize,i) in fontSizes"  :key="i">{{ fontSize }}</option></select>
      </div>
      <div class="label font-weights"> 
        <p>Font Weight</p>
        <select @change="configureFont('fontWeight')" v-model="font.fontWeight"><option v-for="(fontWeight,i) in fontWeights" :key="i">{{ fontWeight }}</option></select>
      </div>
      <div class="label font-styles"> 
        <p>Font Style</p>
        <select @change="configureFont('fontStyle')" v-model="font.fontStyle"><option v-for="(fontStyle,i) in fontStyles" :key="i">{{ fontStyle }}</option></select>
      </div>
    </div>
    <Quill v-if="quill" :item="quill" :selected-font="selectedFont" @emit="emit" />
    <ViewDocs v-if="previewDocs" :item="previewDocs" @emit="emit" />
    <Monoco v-if="monoco" :item="monoco" @emit="emit" />
	</div>
</template>

<script>

import Quill from '@/components/Quill.vue'
// import QuillView from '@/components/QuillView.vue'
import Monoco from '@/components/Monoco.vue'
import ViewDocs from '@/components/ViewDocs.vue'
import { mapActions } from 'vuex'

export default {
  name: 'App',
  components: {
		Quill,
    // QuillView,
    ViewDocs,
    Monoco
  },
  computed: {
    fontFamilies () { return this.$store.state.fontFamilies }
  },
  data () {
    return {
      showFontSearch: false,
      selectedFontFamily: false,
      font: {
        fontSize: 20,
        fontWeight: 'normal',
        fontStyle: 'normal'
      },
      fontSizes: new Array(36).fill(true).map((_,i) => i + 12).concat(new Array(35).fill(true).map((_,i) => (i + 24) * 2)).concat(new Array(35).fill(true).map((_,i) => (i + 30) * 4)),
      fontWeights: [
        'normal',
        'bold',
        'bolder',
        'lighter',
        '100',
        '200',
        '300',
        '400',
        '500',
        '600',
        '700',
        '800',
        '900'
      ],
      fontStyles: [
        'normal',
        'italic'
      ],
      views: ['quill','monoco','previewDocs'],
      quill: {
        html: '<p>Quill HTML</p>'
      },
      monoco: {
        html: '<p>Monoco HTML</p>'
      },
      previewDocs: {
        html: '<p>Preview HTML</p>'
			},
			selectedFont: '',
    }
  },
  mounted () { 
    this.connect(() => console.log('connected'));
	},
  methods: {
    configureFont ( field ) {
      console.log('configureFont',field);
      console.log('this.font',JSON.parse(JSON.stringify(this.font)));
      this.addStyledFont();
    },
    startShowFocus ( e ) {
      e.target.value = '';
      this.showFontSearch = true
    },
    stopShowFontSearch () {
        setTimeout(() => {
            this.showFontSearch = false;
        },250);
    },
    showFontInput ( e ) {
      this.selectedFontFamily = false;
    },
    filterFonts ( e ) {
      if ( action == 'keydown' ) return;
      var value = e.target.value;
      if ( !value ) return this.fontFamilies.forEach((family,i) => family.show = i < 50);
      var text = new RegExp(value.split('').join(' *'),'i');
      this.fontFamilies.forEach(family => { 
          family.selected = text.test(family.font) 
      });
    },
    selectFontFamily ( font, e ) {
      this.$el.querySelector('.font-select-input').value = font.font;
      this.selectedFont = font.font;
			this.selectedFontFamily = font;
			this.selectedFont = font.font.replace(/ /g, '').toLowerCase()
      this.addFont(font);
    },
    emit ( data ) {
      console.log('emit data',data);
      if ( data.action == 'exit' ) return this.toggle(data.t);
      this.views.forEach(view => {
        view != data.t && this[view] && ( this[view].html = data.HTML );
      });
      console.log('emit',data.t,data);
    },
    toggle ( view ) {
      if ( this[view] ) return this[view] = false;
      var found = false;
      this.views.forEach(View => {
        if ( found ) return;
        if ( this[View] ) { found = this[view] = { html: this[View].html } }
      });
      !found && ( this[view] = { html: '<p>Some Starter Text</p>' })
    },
    addFont ( family ) { // <p class="font-rubicmonoone">Monoco HTML</p> 

      console.log('addFont',family);

      var fontName = family.font.replace(/ /g,'');

      var href = family.href;

      switch ( family.font ) {
          case "Poppins":
              href += ":ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap";
          break;
      }

     this.addHead({
          id: 'link-'+fontName,
          t: 'link',
          href,
          rel: 'stylesheet'                        
      });

      this.addHead({
          id: 'style-'+fontName,
          t: 'style',
          innerHTML: ".font-"+(family.font.replace(/ /g,'').toLowerCase())+"{font-family:'"+family.font+"'}"
			});
			this.addHead({
          id: 'ql-style-'+fontName,
          t: 'style',
          innerHTML: ".ql-font-"+(family.font.replace(/ /g,'').toLowerCase())+"{font-family:'"+family.font+"'}"
			});
			this.addHead({
				id: 'ql-style-label-' + fontName,
				t: 'style',
				innerHTML: '.ql-font span[data-label="'+family.font+'"]::before {font-family: "'+family.font+'"}'
			})
      //this.previewDocs && ( this.previewDocs.html += '<p class="'+'font-'+(family.font.replace(/ /g,'').toLowerCase())+'">'+family.font+'</p>' )
      this.addStyledFont();
    },

    addHead ( data ) {
      if ( document.head.querySelector('#'+data.id) ) return;
      var element = document.createElement(data.t);
			Object.keys(data).filter(k => ['t','innerHTML'].indexOf(k) == -1).forEach(k => element.setAttribute(k,data[k]));
			data.innerHTML && ( element.innerHTML = data.innerHTML );
			console.log('ok-------------', element)
			document.head.appendChild(element);
		},  
		
		addStyledFont () {
      var family = this.selectedFontFamily;
      if ( !this.previewDocs ) return;
      if ( family ) {
        var $class = 'font-'+(family.font.replace(/ /g,'').toLowerCase());
      }
      var $style = '';
          $style += 'font-size:'+this.font.fontSize+'px;'
          $style += 'font-weight:'+this.font.fontWeight+';'
          $style += 'font-style:'+this.font.fontStyle+';';

          this.previewDocs.html += `<p ${$class ? 'class="'+$class+'"' : ''}style="${$style}">${ family ? family.font : 'Sans Serif' }</p>` 

		},
  
    ...mapActions([
      'connect'
    ])
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.font-style-bar {
  float: left;
  width: 100%;
  display: grid;
  grid-template-columns: 440px 120px 120px 120px;
  .label {
    margin: 10px;
    > p { text-align: left; font-size: 12px; font-weight: bold; }
    > select { width: calc(100% - 20px); }
  }
}

.fonts-list {
  float: left;
  
  > input { padding: 0px 5px; }
}

.view-btns {
  float: left;
  width: 100%;
}

.v-alert.w-1200 {
    width: 1200px;
    margin-left: -600px;
}
.v-alert.w-1100 {
    width: 1100px;
    margin-left: -550px;
}
.v-alert.w-400 {
    width: 400px;
    margin-left: -200px;
}
.v-alert.w-500 {
    width: 500px;
    margin-left: -250px;
}
.v-alert.w-800 {
    width: 800px;
    margin-left: -400px;
}
.v-alert.w-900 {
    width: 900px;
    margin-left: -450px;
}
.v-alert.w-600 {
    width: 600px;
    margin-left: -300px;
}    
.fixed-scroller {
    position: fixed;
    top: 0px;
    left: 0px;
    width: 100vw;
    height: 100vh;
    overflow: scroll;
    background-color: rgba(100,100,100,0.5);
    z-index: 20;
    > .v-alert {
        position: absolute;
    }

}    
.dash-nav {
    width: 100%;
    height: 50px;
    background-color: #434c5a;
    position: fixed;
    z-index: 100;
    .dash-ham {
        width: 50px;
        height: 50px;
        position: fixed;
        top: 0px;
        left: 0px;
        z-index: 20;
        > div {
            width: 45px;
            margin: 10px 5px;
            height: 5px;
            background-color: white;
            &:first-child { margin-top: 5px; }
        }
    }
    .dash-menu {
        height: 100vh;
        position: absolute;
        width: 150px;
        left: -150px;
        background-color: #434c5a;
        border-top: 1px solid white;
        transform: translateX(0px);
        transition: transform 0.3s;
        &.show {
            transform: translateX(150px);
        }

        .dash-menu-item {
            color: white;
            width: 150px;
            text-align: left;
            padding-left: 20px;
            width: calc(100% - 20px);
            line-height: 50px;
            border-bottom: 1px solid white;
            &.item-selected-xxx {
                text-decoration: underline;
                font-weight: bold
            }
            &.sub-item {
                padding-left: 60px;
                width: calc(100% - 60px);
                line-height: 40px;
            }
        }
    }
    .show-options {
        position: absolute;
        width: 100%;
        top: 38px;
        left: 0px;
        background-color: #2c3e50;
        z-index: 200;
        padding-bottom: 8px;
        .option-item {
            line-height: 38px;
            width: 100%;
            float: left;
        }
    }
}     
html,body,p {
  margin: 0px;
  padding: 0px;
}  

.ellip {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
} 

#app, .v-alert {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.box-main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    height: 400px;
    .box {
        border-right: 1px solid #c0c0c0;
        width: 100%;
        height: 100%;
        .box-container {
            margin: 5px;
            border: 1px solid #c0c0c0;
            height: calc(100% - 10px);
            overflow-y: scroll;
            .box-item {
                display: grid;
                padding: 4px;
                &:nth-child(odd) { background-color: rgba(100,100,100,0.2); } 
            }
            > p {
                text-align: center;
            }
        }
    }
}

select {
    font-size: 18px;
    width: 310px;
    margin: 0px;
    height: 30px;
}

p.btn.big {
    width: calc(100% - 15px);
    margin: 7px 2px;
    padding: 10px 0px;
    &.w-50 {
        width: calc(50% - 15px);
    }
}

.td-ulb {
    color: blue;
    text-decoration: underline;
}

p.ml-10 {
    margin-left: 10px !important;
}

.arpr-10 {
    text-align: right;
    padding-right: 10px;
}

.ta-c {
    text-align: center;
}

.list-container .list-grid.list-totals {
    padding: 10px 5px;
    border: 1px solid #c0c0c0;
    border-bottom: 0px;
    border-right: 0px;
    border-left: 0px;
    background-color: white;
    &:nth-child(odd) { background-color: white; }
}

.ta-r {
    text-align: right;
}
.mr-10 {
    margin-right: 10px;
}
.a-btn {
    &:active { transform: translate(2px,2px) }
}
h2.reset {
    text-align: center;
    margin-left: 140px;
}

.v-alert {
  position: fixed;
   margin-bottom: 100px;
	width: 370px;
	left: 50%;
	margin-left: -191px;
	background-color: white;
	border: 1px solid #c0c0c0;
	transition: transform 0.35s;
	transform: translateY(0px);
	z-index: 100;
	top: 150px;
	z-index: 30;  
	p, input { font-size: 16px }

  header {
		border-right: 1px solid #c0c0c0;
		border-bottom: 1px solid #c0c0c0;

		p {
			color: black;
			line-height: 38px;
			text-align: left;
			margin-left: 10px;
			width: calc(100% - 60px);
		}
	}
	.v-btns {
		width: 100%;
		float: left;
		border-top: 1px solid #c0c0c0;
		p:nth-child(1) { float: left };
		p:last-child { float: right; }
		p.btn { line-height: 2; font-size: 17px; }
	}
	.message { margin: 20px; width: calc(100% - 40px); text-align: center; float: left; font-size: 17px; line-height: 1.5; }
	input { font-size: 16px; margin: 0px 0px 20px 65px; padding: 5px; width: calc(100% - 130px); }
	.label {
		margin: 10px;
		input { width: calc(100% - 22px); margin: 0px; }
        select { width: calc(100% - 7px); }
        &.w-50 {
            width: calc(50% - 20px);
            float: left;
        }
        &.w-100 {
            width: calc(100% - 20px);
            float: left;
        }
        &.w-33 {
            width: calc(33.333% - 20px);
            float: left;
        }
	}
    label {
        width: calc(100% - 20px);
        float: left;
        margin: 10px 10px 5px 10px;
        p { font-size: 16px; margin: 9px 5px; width: 120px; float: left; }
		> p:nth-child(2) { 
			width: calc(100% - 143px); height: 30px; background-color: rgba(200,200,200,0.4); border: 1px solid #c0c0c0; margin-top: 0px; 
			span {
				margin-left: 5px;
				line-height: 30px;
			}
		}
    input { float: right; width: calc(100% - 150px); margin: 0px; font-size: 16px; }
		textarea {
			width: calc(100% - 147px);
			padding: 5px;
			font-size: 16px;
			margin: 5px 0px 5px 5px;
			min-width: calc(100% - 147px);
			max-width: calc(100% - 147px);
			min-height: 60px;
    	}
    }
}

div.x { position: absolute; right: -3px; top: 0px; width: 42px; height: 42px; }
div.x:before,div.x:after { content: ''; width: 40px; height: 2px; background-color: rgba(0,0,0,0.4); position: absolute; top: 18px; }
div.x:before { transform: rotate(45deg); }
div.x:after { transform: rotate(-45deg); }

.v-alert.pw {
    transition: transform 0.3s;
    transform: translateY(0px);
}  
.v-alert.pw.pw-reset {
    width: 500px;
    margin-left: -250px;
}  
.v-alert.pw.pw-off-top {
    transform: translateY(-1000px);
} 
.ontop-enter-active, .ontop-leave-active {
    transition: transform 0.3s;
}
.ontop-enter-to {
    transform: translateY(0px);
}
.ontop-enter, .ontop-leave-to {
    transform: translateY(-500px);
}
.edit-container .editable-image-container {
    width: 440px;
    margin-top: 2px;
    min-height: 100px;
    float: left;
    position: relative;
    border: 1px solid #c0c0c0;
    img {
        width: 440px;
        float: left;
    }
    .image-editor {
        position: absolute;
        top: 0px;
        height: calc(100% - 20px);
        width: 100%;
        left: 0px;
    }
}    
  
.get-guid {
    background-color: grey;
    float: left;
    width: 18px !important;
    height: 18px;
    padding: 6px 4px 4px 6px;
    position: relative;
    border-radius: 5px;
    margin: 1px 10px;
    &:active { transform: trnaslate(2px,2px); }
} 
.copied {
    position: relative;
    &:after {
        content: '';
        position: absolute;
        top: 6px;
        left: calc(100% - 62px);
        width: 60px;
        height: 20px;
        background-size: contain;
        background-repeat: no-repeat;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAAAgCAMAAABKDfSpAAAAWlBMVEUAAADExMTExMS/v7/ExMTExMTFxcW/v7/ExMTGxsbCwsLExMQ7Ozuzs7NdXV1MTExvb29DQ0O8vLyAgIBubm53d3eioqKZmZmIiIiRkZGqqqpmZmZUVFRVVVUkK6FuAAAAC3RSTlMA778gcIDfEJ9voFLCzbAAAAG+SURBVEjHtZbdkoMgDIXVatvdJCAqgj99/9fcBGW2Y3uBM3JuDIf4mYkoFLseTXWHK1RW9a14162CK/V8o/+UcK3KOqIbuF7NXjXkUB16XUIOldLzJ+RRxWVDLj2K+gJK7765TXF2Zev108MWwKvPppx9k4v6zm7x6N4LOK1UNnxjd34YphCNdrCjOP08stdx6MMMjzzFDEpnkzZqQc2gHk2rsWcL2Xvhiz0tPbEoGQx3yL5OZw84A8yMJFwCZxQ2yaP6jT2hByBjeRT8dLZkcq5lKkk/TAvEVJZRG1vpkGFgxOlUv6XiTcqAaNWRvZiNjWZgaQSPY2TbNLaPbB0vkY2RrYKYTZHdmwQ2od2jVtKFFtlq3dgmrvEJXWTPLqXfq9qJPtw5ot+fR9ju/TYkQ4IOh+izEtgOl3G28pZWM81OlgIh8grXSBubjHbkJLJoR6e3b777YN8/4ZNGNFIyDYioSCobXuxNsLGB9D7RDWx7w+wF6YApv/+rKOZ11IUx9jH8nzgGR0iVtlkK+7Tq4gGQiX0rkn7gXetOo5+Z9+KihhyqM599RHWuM5vo9nspujqcZOvqmuLvVfPYmX+9J4AJGByyHQAAAABJRU5ErkJggg==');
    }
} 
.copy-icon {
    background-image: url('/copy-icon.png');
    background-size: contain;
    width: 30px !important;
    height: 30px;
    float: left;
    background-color: white;
    position: absolute;
    right: 7px; 
    bottom: 7px;
}  
.edit-container {
    float: left;
    width: calc(100% - 20px);
    border: 1px solid #c0c0c0;
    position: relative;
    margin: 10px;
    header {
        border-bottom: 1px solid #c0c0c0;
        float: left;
        width: 100%;
        p { margin: 7px; float: left; font-size: 20px; }
    }
    > .tickets {
        float: left;
        width: calc(100% - 40px);
        margin: 10px;
        border: 1px solid #c0c0c0;
        padding: 10px;
        p.btn.add-class { margin-left: 145px; }
    }
    label,.label {
        width: calc(100% - 10px);
        float: left;
        margin: 10px 5px;
        position: relative;
        > p { width: 140px; float: left; font-size: 18px; margin: 5px 0px; text-align: left; }
        > p.copied:after {
            position: absolute;
            top: -25px;
        }
        input { float: left; }
        > p:nth-child(2) { width: auto; }
        input,textarea { width: calc(100% - 150px); font-size: 18px; padding: 3px; }
        > span { font-size: 14px; margin: 0px 0px 0px 10px; }
        > span.info { margin-top: 8px; float: left;  }
        &.image-label { width: 590px; }
        &.event-capacity {
            p { width: 235px; margin-right: 20px; span:nth-child(1) { float: right; text-align: right; width: 80px; background-color: whitesmoke; padding: 5px; border: 1px solid #c0c0c0; position: relative; top: -5px; left: -5px; } }
        }
        &.ticket {
            width: 500px;
            float: left;
            margin: 0px 10000px 0px 140px; 
            &.header {
                margin: 0px 10000px 0px 140px; 
            }
        }
        &.link {
            input {
                float: left;
                width: 180px;
                margin-top: -1px;
            }
            p.verify-error {
                color: red;
                font-size: 14px;
                width: 300px;
                margin: 7px 0px;
            }
        }
        > div {
            &.copy-icon {
                position: relative;
                margin: 5px;
                left: 10px;
            }
            width: calc(100% + 280px);
            float: left;
            &.class-container { 
                width: 500px; position: relative; 
                float: left;
                > p:nth-child(2) { margin-left: 15px; }
                .x { transform: scale(0.5); position: relative; left: 0px; }
                > * {
                    float: left;
                    &:nth-child(1) { width: 200px; margin: 5px; }
                    &:nth-child(2) { width: 100px; margin: 5px; }            
                }
                
            }
        }
        textarea { min-height: 100px; }
        input.sm-1 { width: 100px; }
        input.sm-2 { width: 200px; }
        input.sm-3 { width: 300px; }
        input.sm-35 { width: 350px; }
        input.sm-4 { width: 400px; }
        input.sm-5 { width: 500px; }
        
    }
    .ck.ck-editor__editable_inline {
        padding: 0px;
    }
    .ck.ck-editor__main {
        p,h1,h2,h3,h4,h5,h8 { padding: 5px; }
        strong { font-weight: 600; }
    }
}
p.btn {
    font-size: 15px;
    line-height: 2;
    width: 120px;
    text-align: center;
    margin: 5px;
    float: left;
    background-color: rgb(0, 123, 200);
	  color: white;
	  text-align: center !important;
    &:active { transform: translate(2px,2px) }
	  &.del {
      background-color: rgba(0,0,0,0);
      color: red;
      text-decoration: underline;
	  }
    &.gr {
      background-color: grey;
    }
    &.sm {
        font-size: 15px;
        line-height: 22px;
    }
}
.btns {
    float: left;
    width: 100%;
    border-top: 1px solid #c0c0c0;    
    p.btn:last-child { float: right; }

}
input,textarea,div#editor .ql-editor * {
    /* font-family: sans-serif !important; */
}
.on-top-enter-active,.on-top-leave-active {
	transform: translateY(0px);
	
}
.on-top-enter,.on-top-leave-to {
	transform: translateY(-1000px);	
}
input[type=checkbox] {
    width: 25px !important;
    height: 25px;
    box-sizing: border-box;
    -webkit-appearance: none;
    border: 1px solid #c0c0c0;
    &:checked {
        background-size: contain;
        background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAQAAAD9CzEMAAAAg0lEQVR4Ae3QvQ2CMRRD0dtRMk74W4zOa7HBNw6EAYKQqHgSDTFC4Js6x9IjpZQ+3YGjl78ykJe/P3n5MhB+H/53+f61/JoTzckvDM40D79ieXy90Dy3F+PFxO5Nvkxs5vN1YjZfJrbz+Toxly8T3cA/TVj4OiEMycSXCWFMiL8upXQDujO26ouV5ZIAAAAASUVORK5CYII=);
    }
    &:focus {
        outline: none;
    }
}

.list-container {
    min-width: calc(100% - 20px);
    width: auto;
    margin: 10px;
    border: 1px solid #c0c0c0;
    position: relative;
    float: left;
    .list-header {
        border-bottom: 1px solid #c0c0c0;
        p { font-size: 20px; text-align: center; line-height: 34px; padding-top: 4px; }
    }
    p { font-size: 14px; }
    .list-grid {
        display: grid;
        padding: 5px;
        &.list-row > div {
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
        }
        p { width: 95%; min-height: 13px; float: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }
    .search {
        border-bottom: 1px solid #c0c0c0;  
        input { width: calc(100% - 20px); padding: 5px; font-size: 20px; }
    }
    .list-row {
        &:nth-child(odd) { background-color: rgba(100,100,100,0.2) }
    }
}
</style>
