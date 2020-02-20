import IDialogOption from './IDialogOption';

export default interface IDialog {
  content: string;
  options: IDialogOption[];
}
