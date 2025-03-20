<template>
  <div class="ai-answer space-y-16" v-if="answer">
    <!-- ask -->
    <div class="space-x-3 flex items-start">
      <div class="flex-1"></div>

      <div class="max-w-[85%] space-y-3 lg:space-y-0">
        <div class="lg:hidden text-right">
          <XUserIcon class="mr-1 mt-1" size="xs" v-if="thread" :uid="thread.owner" />
        </div>

        <div class="flex items-center max-w-[100%]">
          <div class="flex-1"></div>
          <div class="py-4 px-5 bg-panel rounded-xl leading-loose">
            <span ref="askBody" class="text-md markdown-body" v-html="toMarkdown(answer.ask.prompt)"></span>
          </div>
        </div>

        <div class="mx-2 pt-2 text-light text-2xs flex items-center space-x-3">
          <div class="flex-1"></div>
          <XDate :value="answer.createdAt" class="text-success" format="rel" />
          <div class="cursor-pointer text-base text-light hover:text-primary" v-tooltip="`내용 복사`" @click="clipboard(answer.ask.prompt)">
            <IconCopy />
          </div>

          <div class="x-label x-label-xs x-label-default" v-if="answer.temporary">임시</div>
        </div>
      </div>

      <XUserIcon class="mr-1 mt-1 hidden lg:block" size="xs" v-if="thread" :uid="thread.owner" />
    </div>
    <!-- // ask -->

    <!-- response -->
    <div class="space-y-3 lg:space-y-0 lg:space-x-3 lg:flex lg:items-start">
      <AIModelIcon class="mr-1 mt-1" size="xs" :data-assistant-id="answer.assistantId" :data-model="answer.model" />

      <div class="max-w-[85%]">
        <div class="flex items-center max-w-[100%]">
          <div class="x-alert x-alert-danger font-normal py-3 px-5 rounded-xl max-w-[100%]" v-if="error || answer.error">
            <span class="font-bold">
              <span class="mr-1"><IconTriangleAlert class="inline" /></span>
              오류
            </span>
            <br />
            {{ error || answer.error }}
          </div>
          <div class="text-sm py-4 px-5 bg-panel rounded-xl leading-loose max-w-[100%]" v-else>
            <span ref="responseBody" class="text-md markdown-body" v-if="result" v-html="toMarkdown(result)"></span>

            <span class="text-light" v-else-if="answer.status === 'inprogress'">분석 중</span>
            <span class="text-light" v-else>(empty)</span>
          </div>
          <div class="flex-1"></div>
        </div>

        <div class="mt-3" v-if="answer.annotations && answer.annotations.length">
          <div class="px-3 text-2xs text-light font-semibold">출처</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div
              class="inline-flex items-center px-3 py-2 bg-panel rounded-lg"
              v-for="(annotation, index) in answer.annotations"
              :key="`annotation-${index}`"
            >
              <span class="min-w-[20px] mr-2 text-center bg-white text-black rounded p-0 m-0 text-base leading-relaxed">
                <IconFile class="mx-auto" />
              </span>
              <a
                :href="annotation.link || 'javascript:;'"
                :target="annotation.link ? '_blank' : ''"
                rel="noopener noreferrer nofollow"
                class="x-navitem-text flex-1 truncate"
                :class="{
                  'link hover:underline cursor-pointer': annotation.link,
                  'cursor-default': !annotation.link
                }"
              >
                {{ (annotation.attach && annotation.attach.filename) || annotation.text }}
              </a>
            </div>
          </div>
        </div>

        <div class="mx-2 mt-2 text-xs flex items-center space-x-1">
          <XDate :value="answer.completedAt || answer.createdAt" class="text-success" format="rel" />
          <template v-if="answer.model">
            <span>·</span>
            <span class="font-light">{{ answer.model }}</span>
          </template>

          <template v-if="answer.usage">
            <span>·</span>
            <span
              class="font-light cursor-pointer"
              v-tooltip="{
                content: `<span class='text-success'>${
                  (answer.usage.input && answer.usage.input.toLocaleString()) || 0
                } <span class='text-white'>input tokens</span><br/> ${
                  (answer.usage.output && answer.usage.output.toLocaleString()) || 0
                } <span class='text-white'>output tokens</span><br/> ${
                  (answer.usage.total && answer.usage.total.toLocaleString()) || 0
                } <span class='text-white'>total tokens</span></span>`,
                html: true
              }"
            >
              {{ (answer.usage.total && answer.usage.total.toLocaleString()) || 0 }}
              <span class="text-light">Tokens</span>
            </span>
          </template>

          <div class="flex-1"></div>
          <div class="x-label x-label-xs x-label-default" v-if="answer.temporary">임시</div>
          <div class="cursor-pointer text-base text-light hover:text-primary" v-tooltip="`내용 복사`" @click="clipboard(answer.result)">
            <IconCopy />
          </div>
          <div class="cursor-pointer text-base text-light hover:text-primary hidden" v-tooltip="`오디오 생성`">
            <IconAudioWaveform />
          </div>
        </div>
      </div>
    </div>
    <!-- // response -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Ref } from 'vue-property-decorator';
import { IThread, Answer } from '../client';

import marked from 'marked';
import prism from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-markup-templating';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-less';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-bash';
import 'prismjs/themes/prism.css';
import IconFile from 'bootstrap-icons/icons/file-earmark-text.svg';
import 'github-markdown-css/github-markdown.css';

import AIModelIcon from './ai-model-icon.vue';

import XDate from '@/components/common/x-date.vue';
import XUserIcon from '@/components/common/x-user-icon.vue';
import IconAudioWaveform from '@/assets/icons/audio-waveform.svg';
import IconCopy from '@/assets/icons/copy.svg';
import IconTriangleAlert from '@/assets/icons/triangle-alert.svg';

prism.languages.vue = prism.languages.javascript;

const addTargetBlankToExternalLinks = (htmlString): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const links = doc.querySelectorAll('a');

  links.forEach((link) => {
    if (link.href && !link.href.startsWith(window.location.origin)) {
      link.setAttribute('target', '_blank');
    }
  });

  return doc.body.innerHTML;
};

@Component({
  components: {
    AIModelIcon,
    XUserIcon,
    XDate,
    IconFile,
    IconCopy,
    IconAudioWaveform,
    IconTriangleAlert
  }
})
export default class AIAnswer extends Vue {
  @Prop({ required: true }) public dataThread: IThread;
  @Prop({ required: true }) public dataAnswer: Answer;
  @Prop() public dataError: string;
  @Prop() public dataResult: string;

  @Ref()
  public askBody: HTMLElement;
  @Ref()
  public responseBody: HTMLElement;

  public get thread(): IThread {
    return this.dataThread;
  }

  public get answer(): Answer {
    return this.dataAnswer;
  }

  public get error(): string {
    return this.dataError;
  }

  public get result(): string {
    return this.dataResult || (this.dataAnswer?.result as string);
  }

  public mounted() {
    this.highlight();
  }

  public toMarkdown(md: any): string {
    if (!md || typeof md !== 'string') return null;
    if ((md.split('```').length - 1) % 2 === 1) {
      md = md + '\n```';
    }
    return addTargetBlankToExternalLinks(marked(md));
  }

  @Watch('dataAnswer')
  @Watch('dataResult')
  private highlight() {
    this.askBody?.querySelectorAll('code[class^="lang-"], code[class^="language-"]')?.forEach((el) => {
      prism.highlightElement(el);
    });
    this.responseBody?.querySelectorAll('code[class^="lang-"], code[class^="language-"]')?.forEach((el) => {
      prism.highlightElement(el);
    });
  }

  public clipboard(value: any) {
    //
  }
}
</script>
