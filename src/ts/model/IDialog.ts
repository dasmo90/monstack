import IDialogOption from './IDialogOption';
import {ReactNode} from "react";

export default interface IDialog {
  content?: string;
  reactContent?: ReactNode;
  options: IDialogOption[];
}
