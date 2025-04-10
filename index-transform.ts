import {TargetOptions} from "@angular-builders/custom-webpack";

export default (target: TargetOptions, indexHtml: string): string => {
  console.log(target);
  return indexHtml.replace(/type="module"/g, '');
}
