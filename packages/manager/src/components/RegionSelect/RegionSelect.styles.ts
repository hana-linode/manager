import DoneIcon from '@mui/icons-material/Done';
import { styled } from '@mui/material/styles';

import { Box } from 'src/components/Box';
import { ListItem } from 'src/components/ListItem';

export const StyledAutocompleteContainer = styled(Box, {
  label: 'RegionSelect',
})(({ theme }) => ({
  '& .MuiAutocomplete-groupLabel': {
    color: theme.color.headline,
    fontFamily: theme.font.bold,
    fontSize: '1rem',
    lineHeight: 1,
    padding: '16px 4px 8px 10px',
    textTransform: 'initial',
  },
  '& .MuiAutocomplete-listbox': {
    '& li:first-of-type .MuiAutocomplete-groupLabel': {
      marginTop: -8,
    },
  },
  '& .MuiAutocomplete-root .MuiAutocomplete-inputRoot': {
    paddingRight: 8,
  },
  display: 'flex',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

export const sxEdgeIcon = {
  '& svg': {
    color: 'inherit !important',
    height: 21,
    width: 24,
  },
  '&:hover': {
    color: 'inherit',
  },
  color: 'inherit',
  padding: 0,
};

export const StyledEdgeBox = styled(Box, { label: 'StyledEdgeBox' })(
  ({ theme }) => ({
    '& svg': {
      height: 21,
      marginLeft: 8,
      marginRight: 8,
      width: 24,
    },
    alignSelf: 'end',
    color: 'inherit',
    display: 'flex',
    marginLeft: 8,
    padding: '8px 0',
    [theme.breakpoints.down('md')]: {
      alignSelf: 'start',
      marginLeft: 0,
    },
  })
);

export const StyledFlagContainer = styled('div', {
  label: 'RegionSelectFlagContainer',
})(({ theme }) => ({
  marginRight: theme.spacing(1),
}));

export const StyledLParentListItem = styled(ListItem, {
  label: 'RegionSelectParentListItem',
})(() => ({
  '&.MuiListItem-root': {
    '&:first-of-type > div': {
      paddingTop: 10,
    },
    display: 'block',
    padding: 0,
  },
}));

export const StyledListItem = styled(ListItem, {
  label: 'RegionSelectListItem',
})(() => ({
  '&.Mui-disabled': {
    cursor: 'not-allowed',
  },
  '&.MuiAutocomplete-option': {
    minHeight: 'auto !important',
    padding: '8px 10px !important',
  },
  '&.MuiListItem-root[aria-disabled="true"]:active': {
    pointerEvents: 'none !important',
  },
}));

export const SelectedIcon = styled(DoneIcon, {
  label: 'RegionSelectSelectedIcon',
  shouldForwardProp: (prop) => prop != 'visible',
})<{ visible: boolean }>(({ visible }) => ({
  height: 17,
  marginLeft: '-2px',
  marginRight: '5px',
  visibility: visible ? 'visible' : 'hidden',
  width: 17,
}));
