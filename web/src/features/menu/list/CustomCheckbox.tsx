import { Checkbox, createStyles } from '@mantine/core';

const useStyles = createStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'rgba(48, 48, 48, 0.9)',
    '&:checked': { backgroundColor: 'rgba(48, 45, 45, 0.9)', borderColor: 'rgba(48, 42, 42, 0.9)' },
  },
  inner: {
    '> svg > path': {
      fill: 'rgba(48, 48, 48, 0.9)',
    },
  },
}));

const CustomCheckbox: React.FC<{ checked: boolean }> = ({ checked }) => {
  const { classes } = useStyles();
  return (
    <Checkbox
      checked={checked}
      size="md"
      classNames={{ root: classes.root, input: classes.input, inner: classes.inner }}
    />
  );
};

export default CustomCheckbox;
