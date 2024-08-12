import { useNuiEvent } from '../../hooks/useNuiEvent';
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Box, Center, createStyles, Group, keyframes, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import React, { useState } from 'react';
import tinycolor from 'tinycolor2';
import type { NotificationProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';

// Import sound files
import errorSound from '../../sounds/error.ogg';
import successSound from '../../sounds/success.ogg';
//import warningSound from '../../sounds/warning.ogg';
import infoSound from '../../sounds/info.ogg';

const useStyles = createStyles((theme) => ({
  container: {
    display: 'flex', // Use flexbox for layout
    alignItems: 'center', // Center items vertically
    maxWidth: '100%', // Ensures the box doesn’t exceed the screen width
    padding: '6px 12px', // Increased padding for more space and better look
    backgroundColor: 'rgba(48, 48, 48, 0.8)', // Base dark background with 80% transparency
    color: '#FFFFFF', // White text color for contrast
    borderRadius: '20px 20px 20px 20px', // Rounded left side
    fontFamily: 'Roboto, sans-serif', // Ensure fallback to sans-serif
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)', // Deeper shadow for a more prominent effect
    border: '1px solid rgba(255, 255, 255, 0.2)', // Subtle border for better definition
    position: 'relative',
    overflow: 'hidden',
    textAlign: 'left', // Center text horizontally
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '50px', // Width of the curved corner
      height: '100%',
      background: 'linear-gradient(to bottom right, rgba(48, 48, 48, 0.9), rgba(38, 38, 38, 0.9))',
      boxShadow: '4px 0 12px rgba(0, 0, 0, 0.5)', // Shadow for curved corner
      zIndex: 0,
    },
  },
  description: {
    fontSize: 14, // Increased font size for better readability
    color: '#FFFFFF', // White text color
    lineHeight: '1.4',
    flex: 1, // Allow text to grow and take available space
    textAlign: 'center', // Align text to the left to balance the icon
    zIndex: 1, // Ensure text is in front
  },
  durationCircle: {
    //marginRight: 12, // Space between icon and text
    zIndex: 1, // Ensure icon is in front
    '> svg > circle:nth-of-type(2)': {
      strokeDasharray: `${15.1 * 2 * Math.PI}, 0`, // Circular progress styling
    },
  },
  iconContainer: {
    position: 'relative',
    zIndex: 1, // Ensure icon container is in front
    //marginRight: 12, // Space between icon and text
  },
}));

const createAnimation = (from: string, to: string, visible: boolean) => keyframes({
  from: {
    opacity: visible ? 0 : 1,
    transform: `translate${from}`,
  },
  to: {
    opacity: visible ? 1 : 0,
    transform: `translate${to}`,
  },
});

const getAnimation = (visible: boolean, position: string) => {
  const animationOptions = visible ? '0.2s ease-out forwards' : '0.4s ease-in forwards'
  let animation: { from: string; to: string };

  if (visible) {
    animation = position.includes('bottom') ? { from: 'Y(30px)', to: 'Y(0px)' } : { from: 'Y(-30px)', to:'Y(0px)' };
  } else {
    if (position.includes('right')) {
      animation = { from: 'X(0px)', to: 'X(100%)' }
    } else if (position.includes('left')) {
      animation = { from: 'X(0px)', to: 'X(-100%)' };
    } else if (position === 'top-center') {
      animation = { from: 'Y(0px)', to: 'Y(-100%)' };
    } else if (position === 'bottom') {
      animation = { from: 'Y(0px)', to: 'Y(100%)' };
    } else {
      animation = { from: 'X(0px)', to: 'X(100%)' };
    }
  }

  return `${createAnimation(animation.from, animation.to, visible)} ${animationOptions}`
};

const durationCircle = keyframes({
  '0%': { strokeDasharray: `0, ${15.1 * 2 * Math.PI}` },
  '100%': { strokeDasharray: `${15.1 * 2 * Math.PI}, 0` },
});

const playNotificationSound = (type: string) => {
  let sound;

  switch (type) {
    case 'error':
      sound = new Audio(errorSound);
      break;
    case 'success':
      sound = new Audio(successSound);
      break;
    case 'warning':
      sound = new Audio(infoSound);
      break;
    default:
      sound = new Audio(infoSound);
      break;
  }

  sound.play();
};

const Notifications: React.FC = () => {
  const { classes } = useStyles();
  const [toastKey, setToastKey] = useState(0);

  useNuiEvent<NotificationProps>('notify', (data) => {
    if (!data.description) return;

    const toastId = data.id?.toString();
    const duration = data.duration || 3000;

    let iconColor: string;
    let position = data.position || 'top-right';

    data.showDuration = data.showDuration !== undefined ? data.showDuration : true;

    if (toastId) setToastKey(prevKey => prevKey + 1);

    // Play the notification sound
    playNotificationSound(data.type || 'defaultSound');

    // Backwards compat with old notifications
    switch (position) {
      case 'top':
        position = 'top-center';
        break;
      case 'bottom':
        position = 'bottom-center';
        break;
    }

    if (!data.icon) {
      switch (data.type) {
        case 'error':
          data.icon = 'circle-xmark';
          break;
        case 'success':
          data.icon = 'circle-check';
          break;
        case 'warning':
          data.icon = 'circle-exclamation';
          break;
        default:
          data.icon = 'circle-info';
          break;
      }
    }

    if (!data.iconColor) {
      switch (data.type) {
        case 'error':
          iconColor = 'red.6';
          break;
        case 'success':
          iconColor = 'teal.6';
          break;
        case 'warning':
          iconColor = 'yellow.6';
          break;
        default:
          iconColor = 'blue.6';
          break;
      }
    } else {
      iconColor = tinycolor(data.iconColor).toRgbString();
    }
    
    toast.custom(
      (t) => (
        <Box
          sx={{
            animation: getAnimation(t.visible, position),
            ...data.style,
          }}
          className={`${classes.container}`}
        >
          <Group noWrap spacing={12} align="center" style={{ width: '100%' }}>
            {data.icon && (
              <Box className={classes.iconContainer}>
                {data.showDuration ? (
                  <RingProgress
                    key={toastKey}
                    size={38}
                    thickness={2}
                    sections={[{ value: 100, color: iconColor }]}
                    className={classes.durationCircle}
                    style={{ flexShrink: 0 }}
                    styles={{
                      root: {
                        '> svg > circle:nth-of-type(2)': {
                          animation: `${durationCircle} linear forwards reverse`,
                          animationDuration: `${duration}ms`,
                        },
                        margin: -3,
                      },
                    }}
                    label={
                      <Center>
                        <ThemeIcon
                          color={iconColor}
                          radius="xl"
                          size={32}
                          variant={tinycolor(iconColor).getAlpha() < 0 ? undefined : 'light'}
                        >
                          <LibIcon icon={data.icon} fixedWidth color={iconColor} animation={data.iconAnimation} />
                        </ThemeIcon>
                      </Center>
                    }
                  />
                ) : (
                  <ThemeIcon
                    color={iconColor}
                    radius="xl"
                    size={32}
                    variant={tinycolor(iconColor).getAlpha() < 0 ? undefined : 'light'}
                    style={{ flexShrink: 0 }}
                  >
                    <LibIcon icon={data.icon} fixedWidth color={iconColor} animation={data.iconAnimation} />
                  </ThemeIcon>
                )}
              </Box>
            )}
            <Text className={classes.description}>{data.description}</Text>
          </Group>
        </Box>
      ),
      {
        id: toastId,
        duration: duration,
        position: position,
      }
    );
  });

  return <Toaster />;
};

export default Notifications;
