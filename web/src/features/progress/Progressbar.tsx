import React from 'react';
import { Box, createStyles, Text } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import type { ProgressbarProps } from '../../typings';

const useStyles = createStyles((theme) => ({
  container: {
    width: 350,
    height: 45,
    borderRadius: theme.radius.sm,
    background: 'linear-gradient(45deg, rgba(54, 54, 54, 0.8), rgba(79, 79, 79, 0.8))',
    overflow: 'hidden',
    boxShadow: `0 0 10px rgba(0, 0, 0, 0.5)`,
  },
  wrapper: {
    width: '100%',
    height: '25%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    position: 'absolute',
  },
  bar: {
    height: '20%',
    background: 'linear-gradient(45deg, #ff0000, #ff9900)', // Adjust gradient colors as needed
    boxShadow: `0 0 5px rgba(0, 0, 0, 0.8)`,
  },
  labelWrapper: {
    position: 'absolute',
    width: 350,
    height: 30,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    background: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    backdropFilter: 'blur(5px)', // Blurred effect for modern look
    boxShadow: `0 0 15px rgba(0, 0, 0, 0.6)`,
  },
  label: {
    maxWidth: 350,
    padding: 8,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: 20,
    color: '#ffffff',
    textShadow: `0 0 5px rgba(0, 0, 0, 0.7)`, // Glow effect for text
  },
}));

const Progressbar: React.FC = () => {
  const { classes } = useStyles();
  const [visible, setVisible] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [duration, setDuration] = React.useState(0);

  useNuiEvent('progressCancel', () => setVisible(false));

  useNuiEvent<ProgressbarProps>('progress', (data) => {
    setVisible(true);
    setLabel(data.label);
    setDuration(data.duration);
  });

  return (
    <Box className={classes.wrapper}>
      <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
        <Box className={classes.container}>
          <Box
            className={classes.bar}
            onAnimationEnd={() => setVisible(false)}
            sx={{
              animation: 'progress-bar linear',
              animationDuration: `${duration}ms`,
            }}
          />
          <Box className={classes.labelWrapper}>
            <Text className={classes.label}>{label}</Text>
          </Box>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default Progressbar;
