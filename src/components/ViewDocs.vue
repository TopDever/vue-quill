<template>
    <div class="v-alert doc-main-container" :style="{ top: top+'px', left: left+'px', width: width+'px', height: height+'px', marginLeft: '0px' }">
        <header @mousedown="startMove($event)"><p>Rendered HTML</p><div class="x" @click="exit()"></div></header>
        <div class="doc-box">
            <div class="doc-content" :style="{  height: (height - 38)+ 'px' }">
                <div class="scroller ql-editor" v-html="item.html">

                </div>
                <div class="size-box" @mousedown="startSize($event)"></div>
            </div>
        </div>
    </div>
</template>

<script>

import WebSoc from '@/utils/WebSoc.js'

export default {
    props: ['item'],
    data () {
        return {
            hideMenu: false,
            moving: false,
            sizing: false,
            startX: 0,
            startY: 0,
            top: 100,
            left: 700,
            width: 400,
            height: 500,
            content: '',
            quill_id: ''
        }
    },
    beforeDestroy () {
        this.stopListen();
    },
    created () {

    },
    mounted () {
        console.log('ViewDocs this.item',this.item);
        this.startListen();
    },
    methods: {
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
                this.width = width;
                var height = this.height - ( startY - clientY );
                this.height = height;
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
        exit () {
            this.$emit('emit',{ t: 'previewDocs', action: 'exit' })
        },
        emit ( data ) {
            this.$emit('emit',data);
        },
        clearAllSections () {
            this.doc.sections.forEach(section => {
                section.selected = false;
                section.subs.forEach(sub => sub.selected = false);
            });
        },
        getSubSection ( section, sub ) {
            this.clearAllSections();
            sub.selected = true;
            this.$forceUpdate()
            if ( this.quill_id != section.quill_id ) {
                WebSoc.SEND({ t: 'xGet', data: { DB: 'quill', _id: section.quill_id }},quill => {
                    this.quill_id = quill._id;
                    this.content = quill.docHTML;
                    scrollIntoView(this.$el,sub.id);
                })                
            } else {
                scrollIntoView(this.$el,sub.id);
            }

            function scrollIntoView($el,id) {
                var element = $el.querySelector('#'+id);
                element && element.scrollIntoView(true);
            }
        },
        getSection ( section ) {
            this.clearAllSections();
            section.selected = true;
            this.$forceUpdate();
            this.$el.querySelector('.doc-content > .scroller').scrollTop = 0;
            if ( this.quill_id == section.quill_id ) return;
            WebSoc.SEND({ t: 'xGet', data: { DB: 'quill', _id: section.quill_id }},quill => {
                this.quill_id = quill._id;
                this.content = quill.docHTML;
            })
        }
    }
}

</script>

<style lang="scss">

.doc-main-container {
    min-width: 170px;
    .doc-box {      
        &.hide {
            grid-template-columns: 1fr;
            .doc-menu {
                display: none;
            }
            .mini-ham {
                transform: translateX(20px);
                background-color: rgba(140, 149, 163,0.3);
            }            
        }
        .doc-menu {
            position: relative;
            background-color: rgba(140, 149, 163,0.3);
            overflow: hidden;
            p { margin: 10px; }
            .doc-main { font-weight: bold; }
            .doc-sub { margin-left: 30px; }
            .doc-main,.doc-sub {
                &.selected {
                    text-decoration: underline;
                }
            }
        }
        .doc-content {
            height: 100%;
            width: 100%;
            position: relative;
            > .scroler {
                margin: 0px 10px;
                overflow-x: hidden;
                overflow-y: scroll;
                float: left;
                width: calc(100% - 20px);
                height: 100%;
                > *:first-child { margin-top: 25px; }
                > *:last-child { margin-bottom: 25px; }
            }
            .mini-ham {
                width: 20px;
                height: 20px;
                position: absolute;
                top: 0px;
                left: -20px;
                margin: 0px;
                > div {
                    width: 18px;
                    height: 2px;
                    background-color: white;
                    float: left;
                    margin: 2px 1px
                }
            }
            .size-box {
                width: 20px;
                height: 20px;
                position: absolute;
                right: 0px;
                bottom: 1px;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 0 20px 20px;
                border-color: transparent transparent whitesmoke transparent;

            }
        }
    }
}

</style>