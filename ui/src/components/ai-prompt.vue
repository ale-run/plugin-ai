<template>
  <div
    class="text-sm py-2"
    @dragover.stop="onDragOver"
    @dragleave.stop="onDragLeave"
    @drop.stop="onDrop"
    :class="{
      'border-primary border-dashed opacity-80': dragover
    }"
  >
    <div class="px-3 w-full flex flex-row gap-1 flex-wrap whitespace-nowrap" v-if="attaches && attaches.length">
      <div class="x-list-item m-0 py-2 px-3 items-center space-x-2 bg-base rounded-lg" v-for="attach in attaches" :key="attach.id">
        <div class="flex-1 truncate">
          <a
            :href="attach.src"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="link hover:underline x-navitem-text"
            :class="{
              'text-muted': attach.progress
            }"
            v-tooltip="{
              content: attach.filename + '<br/><span class=\'text-light\'>' + toReadableBytes(attach.filesize) + '</span>',
              html: true
            }"
          >
            {{ attach.filename }}
          </a>
          <XProgressBar
            v-if="attach.progress"
            class="mt-1 mr-2"
            :data-color="'info'"
            :data-value="attach.progress.loaded"
            :data-max="attach.progress.total"
          />
        </div>
        <div class="" v-if="!attach.progress">
          <a class="cursor-pointer" @click="removeFile(attach.id)"><IconX /></a>
        </div>
      </div>
    </div>

    <!-- top -->
    <div class="flex items-center px-5">
      <textarea
        class="flex-1 bg-transparent border-0 m-0 p-0 outline-none text-md leading-normal text-active font-medium py-2 resize-none"
        placeholder="무엇을 알고 싶나요? 이곳에 질문을 입력하세요."
        v-model="prompt"
        :rows="promptLines"
        @keypress.enter.prevent="submit"
      ></textarea>

      <a
        class="self-stretch py-2 px-5 flex items-center rounded text-muted"
        :class="{
          'cursor-pointer bg-black text-white hover:bg-sky-500 hover:opacity-100': available && prompt,
          'bg-base': !(available && prompt)
        }"
        @click="submit()"
        v-tooltip="`전송하기`"
      >
        <IconEnter />
      </a>
    </div>
    <!-- // top -->

    <div class="flex items-center px-5 py-3">
      <!-- bottom left -->
      <div class="flex-1 flex items-center space-x-4 text-lg text-light">
        <div
          class="cursor-pointer hover:text-primary"
          :class="{
            'text-primary': attaches && attaches.length
          }"
          v-tooltip="`파일 첨부`"
          @click="triggerFileSelect()"
        >
          <IconPaperclib />
        </div>
        <div
          class="cursor-pointer hover:text-primary"
          :class="{
            'text-primary': values.addons && values.addons.includes('web')
          }"
          v-tooltip="`웹 검색 사용`"
          @click="toggleAddon('web')"
        >
          <IconGlobe />
        </div>
        <!--
        <div
          class="cursor-pointer hover:text-primary"
          :class="{
            'text-primary': values.addons && values.addons.includes('image')
          }"
          v-tooltip="`이미지 생성`"
        >
          <IconImage />
        </div>
        <div
          class="cursor-pointer hover:text-primary"
          :class="{
            'text-primary': values.addons && values.addons.includes('video')
          }"
          v-tooltip="`동영상 생성`"
        >
          <IconClapperboard />
        </div>
        -->
        <div
          class="cursor-pointer hover:text-primary"
          :class="{
            'text-primary': values.temporary
          }"
          v-tooltip="`임시 채팅 (기존 대화 기록 사용안함)`"
          @click="toggleTemporary()"
        >
          <IconMessageCircleDashed />
        </div>
      </div>
      <!-- // bottom left -->

      <!-- bottom right -->
      <div class="flex-0 flex items-center space-x-6 text-sm">
        <div class="x-dropdown x-dropdown-align-left x-dropdown-up">
          <a class="cursor-pointer flex items-center space-x-2 px-2 text-sm">
            <template v-if="datastore">
              <IconDatabaseZap class="text-base" />
              <span v-if="datastore">{{ datastore.name }}</span>
              <span class="x-caret x-caret-up"></span>
            </template>
            <template v-else>
              <IconDatabaseZap class="text-muted text-base" />
              <span class="text-muted text-xs">지식 베이스 선택</span>
              <span class="text-muted x-caret x-caret-up"></span>
            </template>
          </a>
          <div class="x-dropdown-items">
            <div class="x-contextmenu">
              <div class="x-list x-list-hover min-w-200">
                <template v-if="datastores && datastores.length">
                  <a class="x-list-item cursor-pointer space-x-3">
                    <span>선택안함</span>
                  </a>
                  <div class="x-separator"></div>
                  <a class="x-list-item cursor-pointer space-x-3" v-for="datastore in datastores" :key="datastore.id">
                    <IconDatabaseZap />
                    <span>{{ datastore.name }}</span>
                  </a>
                  <div class="x-separator"></div>
                </template>
                <a class="x-list-item cursor-pointer space-x-3">
                  <IconDatabaseZap class="text-base" />
                  <span>지식 베이스 추가</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="x-dropdown x-dropdown-align-right x-dropdown-up">
          <a class="cursor-pointer flex items-center space-x-2 px-2 text-sm">
            <template v-if="model">
              <AIModelIcon :data-assistant-id="assistant.id" :data-model="model" />
              <span v-if="model">{{ model.displayName || model.name }}</span>
              <span class="x-caret x-caret-up"></span>
            </template>
            <template v-else>
              <span class="text-muted text-xs">사용 가능한 모델이 없습니다.</span>
            </template>
          </a>
          <div class="x-dropdown-items">
            <div class="x-contextmenu">
              <div class="x-list x-list-hover min-w-200">
                <a class="x-list-item cursor-pointer" v-for="model in models" :key="model.name" @click="selectModel(model.name)">
                  <div class="flex-1 flex items-center font-medium space-x-3">
                    <AIModelIcon :data-assistant-id="assistant.id" :data-model="model" />
                    <div class="flex-1 text-xs">
                      <div class="font-medium text-active">
                        {{ model.displayName || model.name }}
                        <small class="text-light">{{ model.name }}</small>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="cursor-pointer hover:text-primary hidden" v-tooltip="`설정`">
          <IconSettings />
        </div>
      </div>
      <!-- // bottom right -->
    </div>

    <input type="file" ref="fileInput" multiple @change="handleFileSelect" hidden />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { connector, uniqid, ResourceUnit } from '@ale-run/connector';
import { IAssistant, IThread, Model, Ask, DataStore } from '@/client';

import AIModelIcon from './ai-model-icon.vue';

import XDate from '@/components/common/x-date.vue';
import XUserIcon from '@/components/common/x-user-icon.vue';
import XProgressBar from '@/components/common/x-progress-bar.vue';

import IconPaperclib from '@/assets/icons/paperclip.svg';
import IconDatabaseZap from '@/assets/icons/database-zap.svg';
import IconGlobe from '@/assets/icons/globe.svg';
import IconImage from '@/assets/icons/image.svg';
import IconClapperboard from '@/assets/icons/clapperboard.svg';
import IconMessageCircleDashed from '@/assets/icons/message-circle-dashed.svg';

import IconEnter from '@/assets/icons/corner-down-left.svg';
import IconSettings from '@/assets/icons/settings.svg';
import IconX from '@/assets/icons/x.svg';

@Component({
  components: {
    XDate,
    AIModelIcon,
    XUserIcon,
    XProgressBar,
    IconPaperclib,
    IconDatabaseZap,
    IconGlobe,
    IconImage,
    IconClapperboard,
    IconMessageCircleDashed,
    IconEnter,
    IconSettings,
    IconX
  }
  // emits: ['ask']
})
export default class AIPrompt extends Vue {
  @Prop() public dataAssistant: IAssistant;
  @Prop() public dataThread: IThread;

  public enable = true;

  public prompt = '';
  public promptLines = 1;
  public dragover = false;

  public models: Model[] = null;
  public datastores: DataStore[] = null;
  public attaches: Array<{
    id: string;
    filename: string;
    filesize: number;
    src: string;
    progress: { loaded: number; total: number };
  }> = [];

  public values = {
    model: null,
    options: null,
    prompt: null,
    datastore: null,
    addons: null,
    temporary: false,
    responseFormat: null
  };

  public get assistant(): IAssistant {
    return this.dataAssistant || this.dataThread?.getAssistant();
  }

  public get thread(): IThread {
    return this.dataThread;
  }

  public get available(): boolean {
    return !!(this.enable && this.model);
  }

  public get model(): Model {
    const modelname = this.values.model || this.thread?.latest?.model;
    const model = this.models?.find((model) => model.name === modelname);
    if (model) return model;

    return this.models && this.models[0];
  }

  public get datastore(): DataStore {
    return this.datastores?.find((datastore) => datastore.id === this.values.datastore);
  }

  @Watch('dataAssistant')
  public async reload() {
    const models = await this.assistant?.listModel();
    const datastores = await this.assistant?.listDataStore();
    this.models = models;
    this.datastores = datastores;
  }

  public async mounted() {
    await this.reload();
  }

  public setEnable(enable: boolean) {
    this.enable = !!enable;
  }

  public hasAddon(name: string) {
    return this.values.addons?.includes(name) || false;
  }

  public toggleAddon(name: string) {
    const addons = this.values.addons || [];
    if (addons.includes(name)) {
      addons.splice(addons.indexOf(name), 1);
    } else {
      addons.push(name);
    }
    if (!addons.length) this.values.addons = null;
    else this.values.addons = addons;
  }

  public toggleTemporary() {
    this.values.temporary = !this.values.temporary;
  }

  public selectModel(model: string) {
    this.values.model = model;
  }

  public clear() {
    this.prompt = '';
    this.attaches = [];
  }

  @Watch('prompt')
  public updatePromptLine() {
    const promptLines = this.prompt?.split('\n').length;
    this.promptLines = promptLines > 1 ? (promptLines > 10 ? 10 : promptLines) : 1;
  }

  public submit(event?: any) {
    if (event?.shiftKey) {
      this.prompt += '\n';
      this.promptLines += 1;
      return;
    }

    if (!this.available || !this.prompt) return;

    const ask: Ask = Object.assign({}, this.values, {
      streaming: true,
      model: this.model?.name,
      options: this.values.options || undefined,
      files: this.attaches?.length ? this.attaches?.map((attach) => ({ filename: attach.filename, src: attach.src })) : undefined,
      prompt: this.prompt,
      datastore: this.values.datastore || undefined,
      addons: this.values.addons?.length ? this.values.addons : undefined,
      temporary: this.values.temporary === true ? true : false,
      responseFormat: this.values.responseFormat || undefined
    });

    this.$emit('ask', {
      ask
    });

    this.clear();
  }

  public onDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';

    if (~e.dataTransfer.types.indexOf('Files')) this.dragover = true;
  }

  public onDragLeave() {
    this.dragover = false;
  }

  public onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragover = false;

    if (event.dataTransfer?.files) {
      const files = Array.from(event.dataTransfer.files);
      files.forEach((file) => {
        this.uploadFile(file);
      });
    }
  }

  public handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      const files = Array.from(input.files);
      files.forEach((file) => {
        this.uploadFile(file);
      });
    }
  }

  public triggerFileSelect(): void {
    (this.$refs.fileInput as HTMLInputElement).click();
  }

  public async uploadFile(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const attach = {
      id: uniqid(),
      filename: file.name,
      filesize: 0,
      src: null,
      progress: { loaded: 0, total: 0 }
    };

    try {
      this.attaches.unshift(attach);

      const session = await connector.getSession();
      if (!session) throw new Error('session is required');

      const response = await connector.post(`/files/user/${connector.session.uid}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress(event) {
          const { loaded, total } = event;
          if (!total) return;

          attach.filesize = total;
          attach.progress = { loaded, total };
        }
      });

      const endpoint = connector.resolve();
      attach.src = response.url?.startsWith('/') ? `${endpoint}${response.url}` : response.url;
      attach.progress = null;

      this.$forceUpdate();
    } catch (error) {
      console.error(error);
      if (this.attaches.includes(attach)) this.attaches.splice(this.attaches.indexOf(attach), 1);
    }
  }

  public async removeFile(id: string) {
    const attach = this.attaches?.find((item) => item.id === id);
    if (!attach) throw new Error(`attach file "${id}" not found`);

    this.attaches?.splice(this.attaches.indexOf(attach), 1);
  }

  public toReadableBytes(bytes: number): string {
    return ResourceUnit.readable(bytes);
  }
}
</script>
