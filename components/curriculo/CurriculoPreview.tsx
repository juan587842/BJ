'use client';

import ClassicoTemplate from './templates/ClassicoTemplate';
import ModernoTemplate from './templates/ModernoTemplate';
import MinimalistaTemplate from './templates/MinimalistaTemplate';
import type { Curriculo, TemplateId } from '@/types/curriculo';

export default function CurriculoPreview({ curriculo, template }: { curriculo: Curriculo; template: TemplateId }) {
  switch (template) {
    case 'moderno':
      return <ModernoTemplate curriculo={curriculo} />;
    case 'minimalista':
      return <MinimalistaTemplate curriculo={curriculo} />;
    case 'classico':
    default:
      return <ClassicoTemplate curriculo={curriculo} />;
  }
}
