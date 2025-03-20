import Vue from 'vue';
import VueI18n from 'vue-i18n';
import ko from './ko';
import en from './en';
import ja from './ja';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: navigator?.language?.split('-')[0] || 'en',
  fallbackLocale: 'en',
  messages: {
    ko,
    en,
    ja
  }
});

export default i18n;
