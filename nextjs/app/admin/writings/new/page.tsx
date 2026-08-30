import React from 'react';
import EssayEditorClient from '../EssayEditorClient';

export const dynamic = 'force-dynamic';

export default function NewEssayPage() {
  return <EssayEditorClient isNew={true} />;
}
