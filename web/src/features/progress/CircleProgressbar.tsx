import React from 'react';
import { createStyles, keyframes, RingProgress, Stack, Text, useMantineTheme } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import type { CircleProgressbarProps } from '../../typings';

// 33.5 is the radius of the circle
const progressCircle = keyframes({
  '0%': { strokeDasharray: `0, ${33.5 * 2 * Math.PI}` },
  '100%': { strokeDasharray: `${33.5 * 2 * Math.PI}, 0` },
});

const useStyles = createStyles((theme, params: { position: 'middle' | 'bottom'; duration: number }) => ({
  container: {
    width: '100%',
    height: params.position === 'middle' ? '100%' : '20%',
    bottom: 0,
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    '> svg > circle:nth-child(1)': {
      stroke: `rgba(0, 0, 0, 0.3)`, // Background stroke for the circle
      strokeWidth: 7,
      filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.7))', // Glow effect
    },
    '> svg > circle:nth-child(2)': {
      stroke: 'url(#gradient)', // Reference to the gradient in the SVG
      transition: 'none',
      animation: `${progressCircle} linear forwards`,
      animationDuration: `${params.duration}ms`,
    },
  },
  value: {
    textAlign: 'center',
    fontFamily: 'Roboto Mono, monospace',
    textShadow: `0 0 10px rgba(255, 255, 255, 0.7)`, // Glow effect for text
    color: '#ffffff',
  },
  label: {
    textAlign: 'center',
    textShadow: `0 0 10px rgba(255, 255, 255, 0.7)`, // Glow effect for text
    color: '#ffffff',
    height: 25,
  },
  wrapper: {
    marginTop: params.position === 'middle' ? 25 : undefined,
    background: 'linear-gradient(45deg, rgba(54, 54, 54, 0.6), rgba(79, 79, 79, 0.6))',
    borderRadius: theme.radius.sm,
    padding: 10,
    boxShadow: `0 0 15px rgba(0, 0, 0, 0.6)`, // Shadow for the wrapper
  },
}));

const CircleProgressbar: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [progressDuration, setProgressDuration] = React.useState(0);
  const [position, setPosition] = React.useState<'middle' | 'bottom'>('middle');
  const [value, setValue] = React.useState(0);
  const [label, setLabel] = React.useState('');
  const theme = useMantineTheme();
  const { classes } = useStyles({ position, duration: progressDuration });

  useNuiEvent('progressCancel', () => {
    setValue(99);
    setVisible(false);
  });

  useNuiEvent<CircleProgressbarProps>('circleProgress', (data) => {
    if (visible) return;
    setVisible(true);
    setValue(0);
    setLabel(data.label || '');
    setProgressDuration(data.duration);
    setPosition(data.position || 'middle');
    const onePercent = data.duration * 0.01;
    const updateProgress = setInterval(() => {
      setValue((previousValue) => {
        const newValue = previousValue + 1;
        newValue >= 100 && clearInterval(updateProgress);
        return newValue;
      });
    }, onePercent);
  });

  return (
    <>
      <Stack spacing={0} className={classes.container}>
        <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
          <Stack spacing={0} align="center" className={classes.wrapper}>
            <svg width="0" height="0">
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#ff0000', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#ff9900', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
            <RingProgress
              size={90}
              thickness={7}
              sections={[{ value: value, color: 'url(#gradient)' }]} // Use the gradient from the SVG
              onAnimationEnd={() => setVisible(false)}
              className={classes.progress}
              label={<Text className={classes.value}>{value}%</Text>}
            />
            {label && <Text className={classes.label}>{label}</Text>}
          </Stack>
        </ScaleFade>
      </Stack>
    </>
  );
};

export default CircleProgressbar;
