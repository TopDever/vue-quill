import Vue from 'vue'
import Vuex from 'vuex'
import WebSoc from '@/utils/WebSoc.js'
import fontFamilies from '@/assets/fonts.json'

Vue.use(Vuex)

const url = 'wss://api-v2.dev.memberstar.club/memberStar/fonts/';

export default new Vuex.Store({
  state: {
    fontFamilies: []
  },
  mutations: {
    saveFontFamilies ( state , fontFamilies ) {
      fontFamilies.forEach(f => f.selected = true);
      state.fontFamilies = fontFamilies;
    }
  },
  actions: {
    connect ({ state, commit }) {
      commit('saveFontFamilies',fontFamilies);
      WebSoc(url,{
        onopen ( ws ) {
          ws.SEND({ t: 'getFontFamilies' },fontFamilies => {
            commit('savefontFamilies',fontFamilies);
          })
        },
        onmessage ( msg ) {
          return console.log('msg',msg);
          // Array.isArray(msg.data.fonts) && commit('saveFonts',msg.data.fonts);
        }
      })
    }
  },
  modules: {
  }
})
