import { Workbench } from '@ale-run/connector';
import AIPanel from './components/ai-panel.vue';
// import AISidebarModel from './components/ai-sidebar-model.vue';
// import AISidebarKnowledgebase from './components/ai-sidebar-knowledgebase.vue';
import './i18n';
import './css/index.css';

Workbench.components.regist('AIPanel', AIPanel);
// Workbench.components.regist('AISidebarModel', AISidebarModel);
// Workbench.components.regist('AISidebarKnowledgebase', AISidebarKnowledgebase);

Workbench.components.service['ai-assistant'] = {
  body: 'AIPanel',
  sidebar: ['XDeploymentSidebarAssignees', 'XDeploymentSidebarInfo', 'XDeploymentSidebarActivity']
};
