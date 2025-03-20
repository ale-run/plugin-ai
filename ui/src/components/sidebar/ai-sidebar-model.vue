<template>
  <div class="ai-assistant ai-sidebar-model">
    <div class="x-navbar px-5 mb-3">
      <span class="text-xs text-light font-semibold">Model</span>
      <a
        class="text-light cursor-pointer bg-transparent rounded-circle w-[19px] h-[19px] flex items-center justify-center hover:text-link transition duration-300"
        @click="openConfig"
      >
        <IconGear />
      </a>
    </div>

    <div class="px-1" v-if="assistant">
      <div class="x-dropdown w-full">
        <div
          class="flex space-x-1 items-center py-3 px-4 pr-6 mx-0 hover:bg-hover rounded transition duration-300 cursor-pointer text-light hover:text-default"
        >
          <XIcon size="2xs" class="mr-2" :icon="applied.icon" v-if="applied" />
          <div class="flex-1 flex items-center text-xs">
            <div class="font-medium text-default" v-if="applied">
              {{ applied.displayName || applied.name }}
            </div>
            <div class="text-light text-xs" v-else>No Model</div>
          </div>
          <div class="x-caret x-caret-down mr-3" v-if="models && models.length"></div>
        </div>
        <div class="x-dropdown-items w-full" v-if="models && models.length">
          <div class="x-contextmenu">
            <div class="x-list x-list-hover min-w-200">
              <a class="x-list-item cursor-pointer" v-for="model in models" :key="`${model.provider}-${model.name}`" @click="applyModel(model)">
                <div class="flex-1 flex items-center font-medium space-x-3">
                  <XIcon size="xs" :icon="model.icon" />
                  <div class="flex-1 text-xs">
                    <div class="font-medium">{{ model.displayName || model.name }}</div>
                    <div class="text-light text-2xs">{{ model.name }}</div>
                  </div>
                </div>
                <span class="x-label x-label-2xs x-label-black mx-0 mt-1">{{ model['providerName'] }}</span>
              </a>
            </div>
          </div>
        </div>
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

    <XModal ref="modalConfig">
      <div class="relative lg:my-16 min-w-screen max-w-screen md:min-w-2xl md:max-w-2xl shadow flex">
        <div class="flex-1 flex flex-col x-card rounded-lg">
          <div class="x-navbar border-b border-light">
            <div class="x-navbar m-1.5 space-x-2">
              <span class="p-1 bg-hover rounded">
                <XIcon size="xs" :icon="selected.icon" v-if="selected" />
              </span>
              <span class="hidden lg:inline text-md font-medium">Model settings</span>
            </div>
            <div class="x-navbar m-1.5 mx-2 space-x-3" @click="modalConfig.close()">
              <div class="cursor-pointer rounded-sm font-mono text-[0.6rem] leading-6 px-1.5 ring-slate-100 bg-active text-light">ESC</div>
            </div>
          </div>
          <div class="flex-1">
            <div class="p-8">
              <div class="mb-xs">
                <label class="x-form-label">Model</label>
                <div class="x-dropdown w-full">
                  <div class="flex space-x-1 items-center py-2 px-4 pr-6 mx-0 x-form-control cursor-pointer">
                    <XIcon size="2xs" :icon="selected.icon" v-if="selected" />
                    <div class="flex-1 flex items-center text-xs">
                      <div class="font-medium text-default" v-if="selected">
                        {{ selected.displayName || selected.name }}
                      </div>
                      <div class="text-light text-xs" v-else>No Model</div>
                    </div>
                    <div class="x-caret x-caret-down mr-3" v-if="models && models.length"></div>
                  </div>
                  <div class="x-dropdown-items w-full z-10" v-if="models && models.length">
                    <div class="x-contextmenu">
                      <div class="x-list x-list-hover min-w-200">
                        <a
                          class="x-list-item cursor-pointer"
                          v-for="model in models"
                          :key="`${model.provider}-${model.name}`"
                          @click="selectModel(model)"
                        >
                          <div class="flex-1 flex items-center font-medium space-x-3">
                            <XIcon size="xs" :icon="model.icon" />
                            <div class="flex-1 text-xs">
                              <div class="font-medium">{{ model.displayName || model.name }}</div>
                              <div class="text-light text-2xs">{{ model.name }}</div>
                            </div>
                          </div>
                          <span class="x-label x-label-2xs x-label-black mx-0 mt-1">{{ model['providerName'] }}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mb-xs">
                <label class="x-form-label">Prompt</label>
                <textarea class="x-form-control" placeholder="Prompt" v-model="values.instructions" :rows="5"></textarea>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div class="mb-xs">
                  <label class="x-form-label">
                    Top-P Sampling
                    <span class="text-light font-normal" if="values.topP">- {{ values.topP }}</span>
                  </label>
                  <VueSlider
                    class="mx-2 my-3"
                    v-model="values.topP"
                    :min="0"
                    :max="1"
                    :interval="0.01"
                    :marks="false"
                    tooltipPlacement="bottom"
                  ></VueSlider>
                </div>
                <div class="mb-xs">
                  <label class="x-form-label">
                    출력 다양성 (Temparature)
                    <span class="text-light font-normal" if="values.topP">- {{ values.temperature }}</span>
                  </label>
                  <VueSlider
                    class="mx-2 my-3"
                    v-model="values.temperature"
                    :min="0"
                    :max="2"
                    :interval="0.01"
                    :marks="false"
                    tooltipPlacement="bottom"
                  ></VueSlider>
                </div>

                <div class="mb-xs">
                  <label class="x-form-label">입력 토큰 제한</label>
                  <input type="number" :placeholder="64 * 1024" class="x-form-control w-full" v-model="values.maxPromptTokens" />
                </div>
                <div class="mb-xs">
                  <label class="x-form-label">최대 토큰 제한</label>
                  <input type="number" :placeholder="64 * 1024" class="x-form-control w-full" v-model="values.maxCompletionTokens" />
                </div>
              </div>
            </div>
          </div>
          <div class="pb-8 text-center">
            <a class="btn btn-primary" :class="{ 'btn-disabled': inprogress }" @click="applyConfig()">적용하기</a>
            <a class="btn btn-default" @click="modalConfig.close()">닫기</a>
          </div>
        </div>
      </div>
    </XModal>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Ref } from 'vue-property-decorator';
import { IDeployment, Workbench } from '@ale-run/connector';
import ai from '../client';
import { IAssistant, ModelInfo, AssistantConfig } from '../client';

import VueSlider from 'vue-slider-component';
import 'vue-slider-component/theme/antd.css';

import IconGear from 'bootstrap-icons/icons/gear-fill.svg';
import IconPlayCircle from 'bootstrap-icons/icons/play-circle.svg';
import IconCheck from 'bootstrap-icons/icons/check2-circle.svg';
import IconExclamationCircle from 'bootstrap-icons/icons/exclamation-circle.svg';
import IconCardText from 'bootstrap-icons/icons/card-text.svg';
import IconStopCircle from 'bootstrap-icons/icons/stop-circle.svg';

const XModal = Workbench.components.get('XModal');
const XIcon = Workbench.components.get('XIcon');
const XDate = Workbench.components.get('XDate');

@Component({
  components: {
    VueSlider,
    XModal,
    XIcon,
    XDate,
    IconGear,
    IconCardText,
    IconCheck,
    IconExclamationCircle,
    IconPlayCircle,
    IconStopCircle
  }
})
export default class AISidebarModel extends Vue {
  @Prop({ required: true }) public dataDeployment: IDeployment;
  @Ref()
  public modalConfig: typeof XModal;

  public selected: ModelInfo = null;
  public applied: ModelInfo = null;
  public models: ModelInfo[] = null;

  public assistant: IAssistant = null;
  public loaded = false;
  public inprogress = false;
  public values: AssistantConfig = {
    instructions: null,
    maxPromptTokens: null,
    maxCompletionTokens: null,
    temperature: 1,
    topP: 1
  };

  public get deployment(): IDeployment {
    return this.dataDeployment;
  }

  public async reload() {
    try {
      this.loaded = false;

      if (!this.dataDeployment) throw new Error(`prop "dataDeployment" is required`);

      const deployment = this.dataDeployment;
      const assistant = await ai.getAssistant(deployment.id);
      const models = await ai.listModels();

      this.assistant = assistant;
      this.models = models;
      this.applied = models.find((model) => model.name === assistant?.config?.model);
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

  public async applyModel(model: ModelInfo) {
    if (this.inprogress) return;
    if (model === this.applied) return;

    try {
      this.inprogress = true;

      await this.assistant.updateConfig({
        model: model.name
      });
      this.applied = model;
    } catch (err) {
      Workbench.toast(err);
      throw err;
    } finally {
      this.inprogress = false;
    }
  }

  public async selectModel(model: ModelInfo) {
    this.selected = model;
  }

  public async applyConfig() {
    if (this.inprogress) return;
    try {
      this.inprogress = true;

      this.values.model = this.selected?.name || this.applied?.name;

      await this.assistant.updateConfig(this.values);

      Workbench.toast('적용됨', `모델 설정이 적용되었습니다.`, 'success');
      this.modalConfig.close();
      await this.reload();
    } catch (err) {
      Workbench.toast(err);
      throw err;
    } finally {
      this.inprogress = false;
    }
  }

  public openConfig() {
    this.selected = JSON.parse(JSON.stringify(this.applied));
    this.values = JSON.parse(JSON.stringify(this.assistant.config));
    this.values.temperature = isNaN(+this.values.temperature) ? 1 : +this.values.temperature;
    this.values.topP = isNaN(+this.values.topP) ? 1 : +this.values.topP;

    this.modalConfig.open();
  }
}
</script>
