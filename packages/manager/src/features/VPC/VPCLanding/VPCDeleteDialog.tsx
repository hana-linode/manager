import { useSnackbar } from 'notistack';
import * as React from 'react';

import { TypeToConfirmDialog } from 'src/components/TypeToConfirmDialog/TypeToConfirmDialog';
import { useDeleteVPCMutation } from 'src/queries/vpcs';

interface Props {
  id: number;
  label: string;
  onClose: () => void;
  open: boolean;
}

export const VPCDeleteDialog = (props: Props) => {
  const { id, label, onClose, open } = props;
  const { enqueueSnackbar } = useSnackbar();
  const { error, isLoading, mutateAsync: deleteVPC } = useDeleteVPCMutation(id);

  const onDeleteVPC = () => {
    deleteVPC()
      .then(() => {
        enqueueSnackbar('VPC deleted successfully.', {
          variant: 'success',
        });
        onClose();
      })
      .catch();
  };

  return (
    <TypeToConfirmDialog
      entity={{
        action: 'deletion',
        name: label,
        primaryBtnText: 'Delete',
        type: 'VPC',
      }}
      errors={error}
      label="VPC Label"
      loading={isLoading}
      onClick={onDeleteVPC}
      onClose={onClose}
      open={open}
      title={`Delete VPC ${label}`}
    ></TypeToConfirmDialog>
  );
};
