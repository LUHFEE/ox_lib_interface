import { TextUiProps } from '../../../typings';
import { debugData } from '../../../utils/debugData';

export const debugTextUI = () => {
  debugData<TextUiProps>([
    {
      action: 'textUi',
      data: {
        title: 'John Wick',
        text: '[E] - Access locker inventory  \n [G] - Do something else',
        position: 'right-center',
        icon: 'door-open',
      },
    },
  ]);
};
