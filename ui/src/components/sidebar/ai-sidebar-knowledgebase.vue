<template>
  <div class="ai-assistant ai-sidebar-knowledgebase">
    <div class="x-navbar px-5 mb-3">
      <span class="text-xs text-light font-semibold">Knowledge Base</span>
      <a
        class="text-light cursor-pointer bg-transparent rounded-circle w-[19px] h-[19px] flex items-center justify-center hover:bg-sky-500 hover:text-white transition duration-300 hover:ring-2 ring-sky-300/20"
        @click="openModal()"
      >
        <IconPlus />
      </a>
      <input type="file" ref="fileInput" @change="handleFileSelect" hidden />
    </div>

    <div v-if="assistant">
      <ul class="x-list text-sm" v-if="attaches && attaches.length">
        <li class="x-list-item" v-for="attach in attaches" :key="attach.id">
          <span class="min-w-[20px] mr-2 text-center bg-white text-black rounded p-0 m-0 text-base leading-relaxed">
            <IconFiletypePDF class="mx-auto" />
          </span>
          <div class="flex-1 truncate">
            <a
              :href="attach.src"
              target="_blank"
              rel="noopener noreferrer nofollow"
              class="link hover:underline x-navitem-text"
              :class="{
                'text-muted': attach['progress']
              }"
              v-tooltip="attach.filename + '<br/><span class=\'text-light\'>' + toReadableBytes(attach.filesize) + '</span>'"
            >
              {{ attach.filename }}
            </a>
            <XProgressBar
              v-if="attach['progress']"
              class="mt-1 mr-2"
              :data-color="'info'"
              :data-value="attach['progress'].loaded"
              :data-max="attach['progress'].total"
            />
          </div>
          <div class="text-sm transition duration-300" v-if="!attach['progress']">
            <div class="x-dropdown x-dropdown-align-right x-dropdown-nocaret">
              <a class="cursor-pointer text-light hover:text-default">
                <IconDots />
              </a>
              <div class="x-dropdown-items">
                <div class="x-contextmenu">
                  <div class="x-list x-list-hover min-w-200">
                    <a class="x-list-item font-medium cursor-pointer" @click="clipboard(attach.src)">
                      <IconClipboard class="icon text-primary" />
                      Copy URL
                    </a>
                    <a class="x-list-item font-medium cursor-pointer text-muted" v-if="attach.connected === false">
                      <IconPlug class="icon" />
                      Connect
                    </a>
                    <a class="x-list-item font-medium cursor-pointer" v-else>
                      <IconDashCircle class="icon text-warning" />
                      Disconnect
                    </a>
                    <div class="x-separator" />
                    <a class="x-list-item font-medium cursor-pointer text-danger" @click="remove(attach.id)">
                      <IconTrash class="icon" />
                      {{ $t('button.remove') }}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <a class="text-muted">
              <IconDots />
            </a>
          </div>
        </li>
      </ul>

      <div class="px-5" v-else>
        <div class="py-2 text-center text-muted text-xs font-normal hidden">No data</div>
      </div>
    </div>

    <div v-else-if="loaded">
      <div class="px-5">
        <div class="x-alert x-alert-danger py-3 px-5 m-0 text-xs">
          <span class="font-semibold mr-2">⚠️</span>
          <span class="font-normal">Disconnected</span>
        </div>
      </div>
    </div>

    <XModal ref="modalAttach">
      <div class="relative lg:my-16 min-w-screen max-w-screen md:min-w-2xl md:max-w-2xl shadow flex">
        <div class="flex-1 flex flex-col x-card rounded-lg">
          <div class="x-navbar border-b border-light">
            <div class="x-navbar m-1.5 space-x-2">
              <span class="p-1 bg-hover rounded">
                <div
                  class="x-iconbox text-active flex items-center justify-center relative x-iconbox-xs radius-circle"
                  style="background-color: rgb(255, 255, 255)"
                >
                  <img
                    src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjI1MDAiIHZpZXdCb3g9Ii0xIC0uMSA5NDkuMSA5NTkuOCIgd2lkdGg9IjI0NzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+Cgk8cGF0aCBkPSJtOTI1LjggNDU2LjNjMTAuNCAyMy4yIDE3IDQ4IDE5LjcgNzMuMyAyLjYgMjUuMyAxLjMgNTAuOS00LjEgNzUuOC01LjMgMjQuOS0xNC41IDQ4LjgtMjcuMyA3MC44LTguNCAxNC43LTE4LjMgMjguNS0yOS43IDQxLjItMTEuMyAxMi42LTIzLjkgMjQtMzcuNiAzNC0xMy44IDEwLTI4LjUgMTguNC00NC4xIDI1LjMtMTUuNSA2LjgtMzEuNyAxMi00OC4zIDE1LjQtNy44IDI0LjItMTkuNCA0Ny4xLTM0LjQgNjcuNy0xNC45IDIwLjYtMzMgMzguNy01My42IDUzLjYtMjAuNiAxNS00My40IDI2LjYtNjcuNiAzNC40LTI0LjIgNy45LTQ5LjUgMTEuOC03NSAxMS44LTE2LjkuMS0zMy45LTEuNy01MC41LTUuMS0xNi41LTMuNS0zMi43LTguOC00OC4yLTE1LjdzLTMwLjItMTUuNS00My45LTI1LjVjLTEzLjYtMTAtMjYuMi0yMS41LTM3LjQtMzQuMi0yNSA1LjQtNTAuNiA2LjctNzUuOSA0LjEtMjUuMy0yLjctNTAuMS05LjMtNzMuNC0xOS43LTIzLjItMTAuMy00NC43LTI0LjMtNjMuNi00MS40cy0zNS0zNy4xLTQ3LjctNTkuMWMtOC41LTE0LjctMTUuNS0zMC4yLTIwLjgtNDYuM3MtOC44LTMyLjctMTAuNi00OS42Yy0xLjgtMTYuOC0xLjctMzMuOC4xLTUwLjcgMS44LTE2LjggNS41LTMzLjQgMTAuOC00OS41LTE3LTE4LjktMzEtNDAuNC00MS40LTYzLjYtMTAuMy0yMy4zLTE3LTQ4LTE5LjYtNzMuMy0yLjctMjUuMy0xLjMtNTAuOSA0LTc1LjhzMTQuNS00OC44IDI3LjMtNzAuOGM4LjQtMTQuNyAxOC4zLTI4LjYgMjkuNi00MS4yczI0LTI0IDM3LjctMzQgMjguNS0xOC41IDQ0LTI1LjNjMTUuNi02LjkgMzEuOC0xMiA0OC40LTE1LjQgNy44LTI0LjMgMTkuNC00Ny4xIDM0LjMtNjcuNyAxNS0yMC42IDMzLjEtMzguNyA1My43LTUzLjcgMjAuNi0xNC45IDQzLjQtMjYuNSA2Ny42LTM0LjQgMjQuMi03LjggNDkuNS0xMS44IDc1LTExLjcgMTYuOS0uMSAzMy45IDEuNiA1MC41IDUuMXMzMi44IDguNyA0OC4zIDE1LjZjMTUuNSA3IDMwLjIgMTUuNSA0My45IDI1LjUgMTMuNyAxMC4xIDI2LjMgMjEuNSAzNy41IDM0LjIgMjQuOS01LjMgNTAuNS02LjYgNzUuOC00czUwIDkuMyA3My4zIDE5LjZjMjMuMiAxMC40IDQ0LjcgMjQuMyA2My42IDQxLjQgMTguOSAxNyAzNSAzNi45IDQ3LjcgNTkgOC41IDE0LjYgMTUuNSAzMC4xIDIwLjggNDYuMyA1LjMgMTYuMSA4LjkgMzIuNyAxMC42IDQ5LjYgMS44IDE2LjkgMS44IDMzLjktLjEgNTAuOC0xLjggMTYuOS01LjUgMzMuNS0xMC44IDQ5LjYgMTcuMSAxOC45IDMxIDQwLjMgNDEuNCA2My42em0tMzMzLjIgNDI2LjljMjEuOC05IDQxLjYtMjIuMyA1OC4zLTM5czMwLTM2LjUgMzktNTguNGM5LTIxLjggMTMuNy00NS4yIDEzLjctNjguOHYtMjIzcS0uMS0uMy0uMi0uNy0uMS0uMy0uMy0uNi0uMi0uMy0uNS0uNS0uMy0uMy0uNi0uNGwtODAuNy00Ni42djI2OS40YzAgMi43LS40IDUuNS0xLjEgOC4xLS43IDIuNy0xLjcgNS4yLTMuMSA3LjZzLTMgNC42LTUgNi41YTMyLjEgMzIuMSAwIDAgMSAtNi41IDVsLTE5MS4xIDExMC4zYy0xLjYgMS00LjMgMi40LTUuNyAzLjIgNy45IDYuNyAxNi41IDEyLjYgMjUuNSAxNy44IDkuMSA1LjIgMTguNSA5LjYgMjguMyAxMy4yIDkuOCAzLjUgMTkuOSA2LjIgMzAuMSA4IDEwLjMgMS44IDIwLjcgMi43IDMxLjEgMi43IDIzLjYgMCA0Ny00LjcgNjguOC0xMy44em0tNDU1LjEtMTUxLjRjMTEuOSAyMC41IDI3LjYgMzguMyA0Ni4zIDUyLjcgMTguOCAxNC40IDQwLjEgMjQuOSA2Mi45IDMxczQ2LjYgNy43IDcwIDQuNiA0NS45LTEwLjcgNjYuNC0yMi41bDE5My4yLTExMS41LjUtLjVxLjItLjIuMy0uNi4yLS4zLjMtLjZ2LTk0bC0yMzMuMiAxMzQuOWMtMi40IDEuNC00LjkgMi40LTcuNSAzLjItMi43LjctNS40IDEtOC4yIDEtMi43IDAtNS40LS4zLTguMS0xLTIuNi0uOC01LjItMS44LTcuNi0zLjJsLTE5MS4xLTExMC40Yy0xLjctMS00LjItMi41LTUuNi0zLjQtMS44IDEwLjMtMi43IDIwLjctMi43IDMxLjFzMSAyMC44IDIuOCAzMS4xYzEuOCAxMC4yIDQuNiAyMC4zIDguMSAzMC4xIDMuNiA5LjggOCAxOS4yIDEzLjIgMjguMnptLTUwLjItNDE3Yy0xMS44IDIwLjUtMTkuNCA0My4xLTIyLjUgNjYuNXMtMS41IDQ3LjEgNC42IDcwYzYuMSAyMi44IDE2LjYgNDQuMSAzMSA2Mi45IDE0LjQgMTguNyAzMi4zIDM0LjQgNTIuNyA0Ni4ybDE5My4xIDExMS42cS4zLjEuNy4yaC43cS40IDAgLjctLjIuMy0uMS42LS4zbDgxLTQ2LjgtMjMzLjItMTM0LjZjLTIuMy0xLjQtNC41LTMuMS02LjUtNWEzMi4xIDMyLjEgMCAwIDEgLTUtNi41Yy0xLjMtMi40LTIuNC00LjktMy4xLTcuNi0uNy0yLjYtMS4xLTUuMy0xLTguMXYtMjI3LjFjLTkuOCAzLjYtMTkuMyA4LTI4LjMgMTMuMi05IDUuMy0xNy41IDExLjMtMjUuNSAxOC03LjkgNi43LTE1LjMgMTQuMS0yMiAyMi4xLTYuNyA3LjktMTIuNiAxNi41LTE3LjggMjUuNXptNjYzLjMgMTU0LjRjMi40IDEuNCA0LjYgMyA2LjYgNSAxLjkgMS45IDMuNiA0LjEgNSA2LjUgMS4zIDIuNCAyLjQgNSAzLjEgNy42LjYgMi43IDEgNS40LjkgOC4ydjIyNy4xYzMyLjEtMTEuOCA2MC4xLTMyLjUgODAuOC01OS43IDIwLjgtMjcuMiAzMy4zLTU5LjcgMzYuMi05My43cy0zLjktNjguMi0xOS43LTk4LjUtMzkuOS01NS41LTY5LjUtNzIuNWwtMTkzLjEtMTExLjZxLS4zLS4xLS43LS4yaC0uN3EtLjMuMS0uNy4yLS4zLjEtLjYuM2wtODAuNiA0Ni42IDIzMy4yIDEzNC43em04MC41LTEyMWgtLjF2LjF6bS0uMS0uMWM1LjgtMzMuNiAxLjktNjguMi0xMS4zLTk5LjctMTMuMS0zMS41LTM1LTU4LjYtNjMtNzguMi0yOC0xOS41LTYxLTMwLjctOTUuMS0zMi4yLTM0LjItMS40LTY4IDYuOS05Ny42IDIzLjlsLTE5My4xIDExMS41cS0uMy4yLS41LjVsLS40LjZxLS4xLjMtLjIuNy0uMS4zLS4xLjd2OTMuMmwyMzMuMi0xMzQuN2MyLjQtMS40IDUtMi40IDcuNi0zLjIgMi43LS43IDUuNC0xIDguMS0xIDIuOCAwIDUuNS4zIDguMiAxIDIuNi44IDUuMSAxLjggNy41IDMuMmwxOTEuMSAxMTAuNGMxLjcgMSA0LjIgMi40IDUuNiAzLjN6bS01MDUuMy0xMDMuMmMwLTIuNy40LTUuNCAxLjEtOC4xLjctMi42IDEuNy01LjIgMy4xLTcuNiAxLjQtMi4zIDMtNC41IDUtNi41IDEuOS0xLjkgNC4xLTMuNiA2LjUtNC45bDE5MS4xLTExMC4zYzEuOC0xLjEgNC4zLTIuNSA1LjctMy4yLTI2LjItMjEuOS01OC4yLTM1LjktOTIuMS00MC4yLTMzLjktNC40LTY4LjMgMS05OS4yIDE1LjUtMzEgMTQuNS01Ny4yIDM3LjYtNzUuNSA2Ni40LTE4LjMgMjguOS0yOCA2Mi4zLTI4IDk2LjV2MjIzcS4xLjQuMi43LjEuMy4zLjYuMi4zLjUuNi4yLjIuNi40bDgwLjcgNDYuNnptNDMuOCAyOTQuNyAxMDMuOSA2MCAxMDMuOS02MHYtMTE5LjlsLTEwMy44LTYwLTEwMy45IDYweiIgLz4KPC9zdmc+Cg=="
                    style="margin: 0px auto; width: 70%; height: 70%"
                  />
                  <span
                    class="hidden bg-green-500 bg-red-500 bg-orange-500 bg-amber-500 bg-yellow-500 bg-lime-500 bg-emerald-500 bg-pink-500 bg-cyan-500 bg-blue-500 bg-indigo-500 bg-sky-500 bg-purple-500/30 text-green-500 text-red-500 text-orange-500 text-amber-500 text-yellow-500 text-lime-500 text-emerald-500 text-pink-500 text-cyan-500 text-blue-500 text-indigo-500 text-sky-500 text-white"
                  ></span>
                </div>
              </span>
              <span class="text-md font-medium">Knowledge Base</span>
            </div>
            <div class="x-navbar m-1.5 mx-2 space-x-3">
              <a
                class="cursor-pointer rounded-sm font-mono text-[0.6rem] leading-6 px-1.5 ring-slate-100 bg-active text-light"
                @click="modalAttach.close()"
              >
                ESC
              </a>
            </div>
          </div>
          <div class="flex-1 p-8">
            <div class="mb-6 flex justify-center">
              <div class="inline-flex items-center py-[2px] px-[2px] bg-btn text-xs font-semibold rounded-sm">
                <a class="cursor-pointer hover:text-primary py-1 px-3 rounded-sm transition duration-300 bg-panel text-primary">File</a>
                <a class="cursor-pointer hover:text-primary py-1 px-3 rounded-sm">URL</a>
                <a class="cursor-pointer hover:text-primary py-1 px-3 rounded-sm">Database</a>
              </div>
            </div>

            <div class="mb-6">
              <div class="border border-dashed border-slate-300 rounded-xl bg-panel-em">
                <div class="text-center py-8">
                  <div class="mx-auto x-iconbox text-active flex items-center justify-center relative x-iconbox-lg bg-transparent">
                    <IconFileArrowUp />
                  </div>
                  <div class="mt-3 text-md font-normal">Drag &amp; Drop your file here</div>
                  <div class="mt-6">
                    <a class="btn btn-md btn-black">Choose file</a>
                  </div>
                  <div class="mt-6">
                    <p class="text-xs text-light">
                      Maximum file size: 10 MB
                      <br />
                      Supported format: pdf, doc, csv, xls, txt
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mb-xs">
              <label class="x-form-label">Files</label>
              <div class="grid grid-cols-1 gap-2">
                <div class="flex items-center rounded-lg bg-panel-em p-3 px-5 space-x-3 border">
                  <div class="flex-0 flex items-center">
                    <IconPDF class="text-2xl" />
                  </div>
                  <div class="flex-1 truncate px-1">
                    <div class="inline-flex max-w-[95%] font-medium text-xs cursor-pointer">file.pdf</div>
                    <div class="text-xs text-light">920 KB</div>
                  </div>
                  <div class="text-sm">
                    <a class="text-light hover:text-default">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="bi bi-three-dots-vertical">
                        <path
                          d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </div>
                <div class="hidden md:flex items-center rounded-lg bg-panel-em p-3 px-5 space-x-3 border">
                  <div class="flex-0 flex items-center">
                    <IconDoc class="text-2xl" />
                  </div>
                  <div class="flex-1 truncate px-1">
                    <div class="inline-flex max-w-[95%] font-medium text-xs cursor-pointer">file.doc</div>
                    <div class="text-xs text-light">2 MB</div>
                  </div>
                  <div class="text-sm">
                    <a class="text-light hover:text-default">
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" class="bi bi-three-dots-vertical">
                        <path
                          d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
                        ></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="pb-8 text-center">
            <a class="btn btn-black">Apply</a>
          </div>
        </div>
      </div>
    </XModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref } from 'vue-property-decorator';
import { connector, IDeployment, Workbench, ResourceUnit } from '@ale-run/connector';
import ai from '../client';
import { IAssistant, Attach } from '../client';
import swal from 'sweetalert';

import IconPlus from 'bootstrap-icons/icons/plus-lg.svg';
import IconDots from 'bootstrap-icons/icons/three-dots-vertical.svg';
import IconFiletypeDoc from 'bootstrap-icons/icons/filetype-doc.svg';
import IconFiletypeDocx from 'bootstrap-icons/icons/filetype-docx.svg';
import IconFiletypePDF from 'bootstrap-icons/icons/filetype-pdf.svg';
import IconClipboard from 'bootstrap-icons/icons/clipboard-check.svg';
import IconDownload from 'bootstrap-icons/icons/arrow-down-circle.svg';
import IconPlug from 'bootstrap-icons/icons/plug.svg';
import IconDashCircle from 'bootstrap-icons/icons/dash-circle.svg';
import IconTrash from 'bootstrap-icons/icons/trash.svg';
import IconFileArrowUp from 'bootstrap-icons/icons/file-earmark-arrow-up.svg';
import IconPDF from './assets/filetype/pdf.svg';
import IconDoc from './assets/filetype/doc.svg';

const XModal = Workbench.components.get('XModal');
const XUserIcon = Workbench.components.get('XUserIcon');
const XDate = Workbench.components.get('XDate');
const XProgressBar = Workbench.components.get('XProgressBar');

@Component({
  components: {
    XModal,
    XUserIcon,
    XDate,
    XProgressBar,
    IconPlus,
    IconDots,
    IconFiletypePDF,
    IconFiletypeDoc,
    IconFiletypeDocx,
    IconClipboard,
    IconDownload,
    IconPlug,
    IconDashCircle,
    IconTrash,
    IconFileArrowUp,
    IconPDF,
    IconDoc
  }
})
export default class AISidebarKnowledgebase extends Vue {
  @Prop({ required: true }) public dataDeployment: IDeployment;

  @Ref()
  public modalAttach: typeof XModal;

  public assistant: IAssistant = null;
  public attaches: Attach[] = null;
  public files: File[] = [];
  public loaded = false;

  public get deployment(): IDeployment {
    return this.dataDeployment;
  }

  public async reload() {
    try {
      this.loaded = false;

      if (!this.dataDeployment) throw new Error(`prop "dataDeployment" is required`);

      const deployment = this.dataDeployment;
      const assistant = await ai.getAssistant(deployment.id);
      const attaches = await assistant.listAttaches();

      this.assistant = assistant;
      this.attaches = attaches?.rows;
    } catch (err) {
      console.error(err);
      this.$emit('error', err);
      throw err;
    } finally {
      this.loaded = true;
    }
  }

  public async mounted() {
    await this.reload();
  }

  public handleDrop(event: DragEvent): void {
    if (event.dataTransfer?.files) {
      const droppedFiles = Array.from(event.dataTransfer.files);
      this.files = [...this.files, ...droppedFiles];
      this.uploadFiles(droppedFiles);
    }
  }

  public handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files) {
      const selectedFiles = Array.from(input.files);
      this.files = [...this.files, ...selectedFiles];
      this.uploadFiles(selectedFiles);
    }
  }

  public triggerFileSelect(): void {
    (this.$refs.fileInput as HTMLInputElement).click();
  }

  public async uploadFiles(files: File[]): Promise<void> {
    if (!files?.length) return;

    const formData = new FormData();
    const file = files[0];
    formData.append('file', file);

    const attach = {
      id: 'inprogress',
      assistantId: this.assistant.id,
      type: '',
      filename: file.name,
      filesize: 0,
      src: null,
      progress: { loaded: 0, total: 0 },
      createdAt: new Date()
    };

    try {
      const project = this.deployment.getStage().getProject();

      this.attaches.unshift(attach);

      const response = await connector.post(`/files/${project.scope}`, formData, {
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
      const src = response.url?.startsWith('/') ? `${endpoint}${response.url}` : response.url;

      await this.assistant.addAttach({ type: response.mimetype, filename: response.filename, src });
      await this.reload();
      Workbench.toast('업로드', `${response.filename} 파일이 업로드되었습니다.`, 'success');
    } catch (error) {
      if (this.attaches.includes(attach)) this.attaches.splice(this.attaches.indexOf(attach), 1);
      Workbench.toast(error);
    }
  }

  public async remove(id: string) {
    const attach = this.attaches?.find((item) => item.id === id);
    if (!attach) throw new Error(`attach file "${id}" not found`);

    if (
      await swal({
        title: `파일을 삭제하시겠습니까?`,
        text: `"${attach.filename}" 파일이 삭제됩니다. 삭제된 파일은 복구할 수 없습니다.`,
        icon: 'error',
        buttons: [true, true]
      })
    ) {
      try {
        await this.assistant.removeAttach(attach.id);
        await this.reload();
        Workbench.toast('파일 삭제', `${attach.filename} 파일이 삭제되었습니다.`, 'success');
      } catch (error) {
        Workbench.toast(error);
      }
    }
  }

  public clipboard(value: string) {
    Workbench.clipboard(value);
  }

  public toReadableBytes(bytes: number): string {
    return ResourceUnit.readable(bytes);
  }

  public openModal() {
    this.modalAttach.open();
  }
}
</script>
