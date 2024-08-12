import React from 'react';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { Box, createStyles, Group, Text } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import ScaleFade from '../../transitions/ScaleFade';
import remarkGfm from 'remark-gfm';
import type { TextUiPosition, TextUiProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';

const useStyles = createStyles((theme, params: { position?: TextUiPosition }) => ({
  wrapper: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    display: 'flex',
    alignItems: 
      params.position === 'top-center' ? 'baseline' :
      params.position === 'bottom-center' ? 'flex-end' : 'center',
    justifyContent: 
      params.position === 'right-center' ? 'flex-end' :
      params.position === 'left-center' ? 'flex-start' : 'center',
  },
  container: {
    fontSize: 16,
    padding: 10,
    margin: 8,
    backgroundColor: 'rgba(40, 40, 40, 0.8)', // Darker background with 80% transparency
    color: '#FFFFFF', // White text color
    fontFamily: 'Roboto',
    borderRadius: theme.radius.sm,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)', // Shadow effect
    border: '1px solid rgba(255, 255, 255, 0.4)', // White outline
    position: 'relative',
    '&:before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: theme.radius.sm,
      padding: '2px',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.5))', // Gradient border
      mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
      maskComposite: 'exclude',
      WebkitMaskComposite: 'xor',
    },
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: '2px',
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)', // Glow effect
  },
  markdown: {
    color: '#FFFFFF',
  },
}));

const TextUI: React.FC = () => {
  const [data, setData] = React.useState<TextUiProps>({
    text: '',
    position: 'right-center',
  });
  const [visible, setVisible] = React.useState(false);
  const { classes } = useStyles({ position: data.position });

  useNuiEvent<TextUiProps>('textUi', (data) => {
    if (!data.position) data.position = 'right-center'; // Default right position
    setData(data);
    setVisible(true);
  });

  useNuiEvent('textUiHide', () => setVisible(false));

  return (
    <>
      <Box className={classes.wrapper}>
        <ScaleFade visible={visible}>
          <Box style={data.style} className={classes.container}>
            {data.title && (
              <>
                <Text className={classes.title}>{data.title}</Text>
                <div className={classes.divider}></div> {/* Line SVG */}
              </>
            )}
            <Group spacing={12}>
              {data.icon && (
                <LibIcon
                  icon={data.icon}
                  fixedWidth
                  size="lg"
                  animation={data.iconAnimation}
                  style={{
                    color: data.iconColor,
                    alignSelf: !data.alignIcon || data.alignIcon === 'center' ? 'center' : 'start',
                  }}
                />
              )}
              <ReactMarkdown components={MarkdownComponents} remarkPlugins={[remarkGfm]} className={classes.markdown}>
                {data.text}
              </ReactMarkdown>
            </Group>
          </Box>
        </ScaleFade>
      </Box>
    </>
  );
};

export default TextUI;
