import React from 'react';
import Link from 'umi/link';
import { formatMessage } from 'umi/locale';
import Exception from '@/components/Exception';

export default () => (
  <Exception
    type="410"
    linkElement={Link}
    hideBackButton
    desc={formatMessage({ id: 'app.exception.description.invalidLink' })}
  />
);
