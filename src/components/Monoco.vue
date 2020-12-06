<template>
    <div class="v-alert monoco" :style="{ top: top+'px', left: left+'px', width: width+'px', height: height+'px', marginLeft: '0px' }">
        <header @mousedown="startMove($event)" style="border-bottom: 1px solid #c0c0c0"><p>Monoco Editor</p><div class="x" @click="$emit('emit',{ t: 'monoco', action: 'exit', html: html })"></div></header>
        <div class="monoco-container">
            <MonacoEditor
                width="100%"
                height="100%"
                theme="vs-dark"
                language="html"
                :options="options"
                @change="change"
            ></MonacoEditor>
            <div class="btns">
                <p class="btn" @click="$emit('emit',{ t: 'monoco', action: 'save', html: html })">save</p>
            </div>
        </div>
    </div>
</template>

<script>

import MonacoEditor from 'monaco-editor-vue';

export default {
    props: ['item'],
    components: { MonacoEditor },
    watch: {
        'item.html' ( HTML ) {
            this.options.value = HTML;
        }
    },
    data () {
        return {
            top: 50,
            left: 100,
            width: 600,
            height: 500,
            html: '',
            options: {
                value: '',
                fontSize: 16
            },
        }
    },
    beforeDestroy () {
        this.stopListen();
    },
    created () {
        console.log('Monoco this.item',this.item.html);
        this.options.value = this.item.html;
    },
    mounted () {
        this.startListen();
    },
    methods: {
        change ( HTML ) {
            this.$emit('emit',{ t: 'monoco', action: 'updateHTML', HTML });
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
.monoco-container {
  width: 100%;
  height: 100%;
  .view-line {
      text-align: left;
  }
}
</style>