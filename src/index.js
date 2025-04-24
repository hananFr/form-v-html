//@ts-check
import FormVHtml from './components/FormVHtml.vue';
import autoLabel from './directives/autoLabel';

// Type definitions are exposed via the 'types' field in package.json
// export type * from './types/index.d.ts'; // Removed this line as it's invalid JS

export { FormVHtml };
export default FormVHtml;
export const install = (app) => {
  app.component('FormVHtml', FormVHtml);
  app.directive('auto-label', autoLabel);
  app.directive('label', autoLabel);
};

