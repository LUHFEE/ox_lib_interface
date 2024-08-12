import { Box, createStyles } from '@mantine/core';
import { useEffect, useState, useRef } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useNuiEvent } from '../../../hooks/useNuiEvent';
import { fetchNui } from '../../../utils/fetchNui';
import { isIconUrl } from '../../../utils/isIconUrl';
import ScaleFade from '../../../transitions/ScaleFade';
import type { RadialMenuItem } from '../../../typings';
import { useLocales } from '../../../providers/LocaleProvider';
import LibIcon from '../../../components/LibIcon';
import selectSound from '../../../sounds/select.ogg'; // Import the sound file

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    top: '50%',
    left: '70%',
    transform: 'translate(-50%, -50%)',
  },
  hexagonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 'fit-content',
    height: 'fit-content',
  },
  hexagonRow: {
    display: 'flex',
    justifyContent: 'center',
    margin: '-5px', // Remove margin between rows
  },
  hexagon: {
    width: 120,
    height: 120,
    cursor: 'pointer',
    margin: '0 2px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    overflow: 'hidden',
    padding: '5px', // Add padding to accommodate text
    transition: 'transform 0.15s, background-color 0.1s, filter 0.3s',
    '&:hover': {
      transform: 'scale(1.1)',
      filter: 'drop-shadow(0 0 1.5vh rgba(0, 0, 0))',
    },
  },
  icon: {
    width: 20,
    height: 20,
    color: '#fff',
  },
  text: {
    fontSize: '0.95rem',
    fontWeight: 600,
    lineHeight: 1.1,
    marginTop: 5,
    color: '#fff',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal', // Allow text to wrap
    textAlign: 'center', // Center text
  },
  centerCircle: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    color: '#F00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'absolute',
    border: '2px solid #fff',
    transition: 'transform 0.3s, background-color 0.1s, box-shadow 0.1s',
    bottom: -70,
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      transform: 'scale(1.1)',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
    },
  },
  centerIcon: {
    color: '#f0000070',
    transition: 'transform 0.3s, color 0.1s',
    '&:hover': {
      color: '#f0000090',
      transform: 'scale(1.1)',
    },
  },
}));

const PAGE_ITEMS = 12;

const HexagonSVG = ({
  children,
  className,
  onHover,
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  onHover?: () => void;
  onClick?: () => void; // Add onClick to the prop types
}) => (
  <svg
    viewBox="0 0 100 100"
    className={className} // Apply the className to the SVG element
    {...props}
    onMouseEnter={onHover} // Attach hover event
    onClick={onClick} // Attach click event
  >
    <polygon
      points="50,1 98,25 98,75 50,99 2,75 2,25"
      style={{ fill: 'rgba(48, 48, 48, 0.8)', stroke: '#6e6b6b', strokeWidth: '2' }}
    />
    {children}
  </svg>
);

const RadialMenu: React.FC = () => {
  const { classes } = useStyles();
  const { locale } = useLocales();
  const [visible, setVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<RadialMenuItem[]>([]);
  const [menu, setMenu] = useState<{ items: RadialMenuItem[]; sub?: boolean; page: number }>({
    items: [],
    sub: false,
    page: 1,
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const changePage = async (increment?: boolean) => {
    setVisible(false);
    const didTransition: boolean = await fetchNui('radialTransition');
    if (!didTransition) return;

    const newPage = increment ? menu.page + 1 : menu.page - 1;
    setMenu((prevMenu) => ({ ...prevMenu, page: newPage }));
    setVisible(true);
  };

  useEffect(() => {
    const getItemsForPage = (items: RadialMenuItem[], page: number) => {
      const startIndex = (page - 1) * PAGE_ITEMS;
      const endIndex = Math.min(startIndex + PAGE_ITEMS, items.length);
      const slicedItems = items.slice(startIndex, endIndex);

      if (endIndex < items.length) {
        slicedItems.push({ icon: 'ellipsis-h', label: locale.ui.more, isMore: true });
      }
      return slicedItems;
    };

    setMenuItems(getItemsForPage(menu.items, menu.page));
  }, [menu.items, menu.page]);

  useNuiEvent('openRadialMenu', async (data: { items: RadialMenuItem[]; sub?: boolean; option?: string } | false) => {
    if (!data) return setVisible(false);
    let initialPage = 1;
    if (data.option) {
      const index = data.items.findIndex((item) => item.menu === data.option);
      if (index !== -1) {
        initialPage = Math.floor(index / PAGE_ITEMS) + 1;
      }
    }
    setMenu({ ...data, page: initialPage });
    setVisible(true);
  });

  useNuiEvent('refreshItems', (data: RadialMenuItem[]) => {
    setMenu((prevMenu) => ({
      ...prevMenu,
      items: data,
      page: 1,
    }));
  });

  const playHoverSound = () => {
    const audio = new Audio(selectSound); // Create a new Audio object for each hover
    audio.volume = 0.2; // Set the volume to 50%
    audio.play(); // Play the sound
  };

  const renderHexagon = (item: RadialMenuItem, index: number) => (
    <HexagonSVG
      key={index}
      className={classes.hexagon}
      onHover={playHoverSound}
      onClick={async () => {
        const clickIndex = index + (menu.page - 1) * PAGE_ITEMS;
        if (!item.isMore) fetchNui('radialClick', clickIndex);
        else {
          await changePage(true);
        }
      }}
    >
      {typeof item.icon === 'string' && isIconUrl(item.icon) ? (
        <image href={item.icon} className={classes.icon} x="40" y="20" height="20px" width="20px" />
      ) : (
        <foreignObject x="40" y="20" width="20" height="20">
          <LibIcon icon={item.icon as IconProp} className={classes.icon} />
        </foreignObject>
      )}
      <foreignObject x="15" y="45" width="70" height="40">
        <div className={classes.text}>{item.label}</div>
      </foreignObject>
    </HexagonSVG>
  );

  return (
    <Box className={classes.wrapper}>
      <ScaleFade visible={visible}>
        <div className={classes.hexagonContainer}>
          {[...Array(Math.ceil(menuItems.length / 4)).keys()].map((row) => {
            const isEvenRow = row % 2 === 0;
            const numItemsInRow = isEvenRow ? 3 : 4;
            const hexagonsInRow = menuItems.slice(row * numItemsInRow, (row + 1) * numItemsInRow);

            return (
              <div key={row} className={classes.hexagonRow}>
                {hexagonsInRow.map((item, index) => renderHexagon(item, index))}
              </div>
            );
          })}
          <div
            className={classes.centerCircle}
            onClick={async () => {
              if (menu.page > 1) await changePage();
              else {
                if (menu.sub) fetchNui('radialBack');
                else {
                  setVisible(false);
                  fetchNui('radialClose');
                }
              }
            }}
          >
            <LibIcon
              icon={!menu.sub && menu.page < 2 ? 'xmark' : 'arrow-rotate-left'}
              fixedWidth
              className={classes.centerIcon}
              color="#f00"
              size="2x"
            />
          </div>
        </div>
      </ScaleFade>
    </Box>
  );
};

export default RadialMenu;
