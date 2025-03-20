<template>
  <div class="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 items-start sm:justify-end" style="z-index: 9999">
    <div class="flex-col space-y-3 md:max-w-lg w-full">
      <transition name="fade" v-for="(message, index) in actives" :key="index">
        <div class="pointer-events-auto rounded-lg bg-glass shadow-md -border -border-[rgba(255,255,255,0.05)] backdrop-blur-md">
          <div class="overflow-hidden relative">
            <div class="p-4">
              <div class="flex items-start">
                <div class="flex-shrink-0">
                  <IconDashCircle class="text-lg text-danger" v-if="message.type === 'error'" />
                  <IconCheckCircle class="text-lg text-primary" v-else-if="message.type === 'success'" />
                  <IconExclamationCircle class="text-lg text-warning" v-else-if="message.type === 'warning'" />
                  <IconInfoCircle class="text-lg text-info" v-else-if="message.type === 'info'" />
                </div>
                <div class="ml-3 w-0 flex-1 pt-0.5">
                  <p class="text-sm leading-5 -text-active font-medium">
                    {{ message.title }}
                  </p>
                  <p class="mt-1 text-sm leading-5 opacity-80 text-[0.85em]" v-html="message.message" />
                </div>
                <div
                  class="absolute right-0 top-0 mt-3 mr-3 radius-circle hover:bg-base flex items-center h-[1.6rem] w-[1.6rem] justify-center text-light hover:text-primary transition duration-150 ease-out hover:ease-in"
                  v-if="message.closable !== false"
                >
                  <a class="cursor-pointer text-xs mb-[1px]" @click="close(message)">
                    <IconX class="icon" />
                  </a>
                </div>
              </div>
              <div class="mt-3 flex items-center place-content-end space-x-1 hidden">
                <a class="btn btn-sm btn-black">Done</a>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ToastMessage } from '@ale-run/connector';
import IconInfoCircle from 'bootstrap-icons/icons/info-circle.svg';
import IconCheckCircle from 'bootstrap-icons/icons/check2-circle.svg';
import IconExclamationCircle from 'bootstrap-icons/icons/exclamation-circle.svg';
import IconDashCircle from 'bootstrap-icons/icons/dash-circle.svg';
import IconX from 'bootstrap-icons/icons/x-lg.svg';

@Component({
  components: {
    IconInfoCircle,
    IconCheckCircle,
    IconExclamationCircle,
    IconDashCircle,
    IconX
  }
})
export default class XToastContainer extends Vue {
  public actives = [];

  public mounted() {
    document.body.addEventListener('keydown', (e) => this.esclistener(e));
  }

  public destroyed() {
    document.body.removeEventListener('keydown', (e) => this.esclistener(e));
  }

  public open(options: ToastMessage | Error | string, message?: string, type?: string) {
    if (options instanceof Error) {
      options = {
        message: options.message,
        type: 'error'
      };
    } else if (typeof options === 'object') {
      options = options as ToastMessage;
    } else if (typeof options === 'string' && !message) {
      options = {
        message: options,
        type: type || 'info'
      } as ToastMessage;
    } else if (typeof options === 'string' && message) {
      options = {
        title: options as string,
        message,
        type: type || 'info'
      } as ToastMessage;
    } else {
      throw new Error(`toast options must be object or string`);
    }

    if (!options.type) options.type = 'info';
    if (!options.title && options.type === 'error') options.title = this.$t('XToastContainer.error')?.toString() || 'Error';
    if (!options.title && options.type === 'success') options.title = this.$t('XToastContainer.success')?.toString() || 'Success';
    if (!options.title && options.type === 'warning') options.title = this.$t('XToastContainer.warning')?.toString() || 'Warning';
    if (!options.title) options.title = this.$t('XToastContainer.info')?.toString() || 'Info';

    this.actives.push(options);
    this.$emit('open');

    setTimeout(() => {
      this.close(options as ToastMessage);
    }, 10 * 1000);
  }

  public close(message?: ToastMessage) {
    if (!message && this.actives.length) this.actives.splice(0, 1);
    else if (~this.actives.indexOf(message)) this.actives.splice(this.actives.indexOf(message), 1);
  }

  public esclistener(e) {
    if (e.keyCode === 27 && this.actives.length) this.close(this.actives[0]);
  }
}
</script>

<style lang="postcss">
.fade-enter-active,
.fade-leave-active {
  -transition: opacity, max-height 0.3s ease-in-out;
  -overflow: hidden;
}

.fade-enter-from,
.fade-leave-to {
  -opacity: 0;
  -max-height: 0;
}
</style>
