import AsyncStorage from '@react-native-community/async-storage';
import ILabel from '../model/ILabel';

export default class Storage {
  addStack(label: string): Promise<ILabel[]> {
    return this.fetchStacks().then(stacks => {
      stacks.push({
        id: `${new Date().getTime()}`,
        label: label,
      });
      return AsyncStorage.setItem('stacks', JSON.stringify(stacks)).then(
        () => stacks,
      );
    });
  }

  removeStack(id: string): Promise<ILabel[]> {
    return AsyncStorage.removeItem(`stack_${id}`).then(() =>
      this.fetchStacks().then(stacks => {
        const newStacks = stacks.filter(stack => stack.id !== id);
        return AsyncStorage.setItem('stacks', JSON.stringify(newStacks)).then(
          () => newStacks,
        );
      }),
    );
  }

  fetchStacks(): Promise<ILabel[]> {
    return AsyncStorage.getItem('stacks').then(
      value => JSON.parse(value || '[]') as ILabel[],
    );
  }

  fetchStackCount(id: string): Promise<number> {
    return AsyncStorage.getItem(`stack_${id}`)
      .then(value => JSON.parse(value || '[]') as ILabel[])
      .then(stack => stack.length);
  }
}
