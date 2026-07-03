<template>
  <div class="markdown-viewer" v-html="renderedMarkdown"></div>
</template>

<script>
import axios from 'axios';

const escapeHtml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const escapeAttribute = value => escapeHtml(value).replace(/`/g, '&#096;');

const renderInline = value =>
  escapeHtml(value)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      return `<img src="${escapeAttribute(src)}" alt="${escapeAttribute(alt)}">`;
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
      return `<a href="${escapeAttribute(href)}">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

const renderMarkdown = markdown => {
  const lines = String(markdown || '').split(/\r?\n/);
  const html = [];
  const paragraph = [];
  let listOpen = false;

  const closeList = () => {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  };

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${paragraph.join('<br>')}</p>`);
      paragraph.length = 0;
    }
  };

  lines.forEach(line => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      closeList();
      return;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      closeList();
      html.push('<hr>');
      return;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      return;
    }

    const listItem = trimmed.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${renderInline(listItem[1])}</li>`);
      return;
    }

    paragraph.push(renderInline(trimmed));
  });

  flushParagraph();
  closeList();

  return html.join('');
};

export default {
  name: 'md-viewer',
  props: {
    src: { type: String, required: true }
  },
  data() {
    return {
      mdText: ''
    };
  },
  computed: {
    renderedMarkdown() {
      return renderMarkdown(this.mdText);
    }
  },
  mounted() {
    axios.get(this.src).then(response => {
      this.mdText = response.data;
    });
  }
};
</script>

<style lang="scss">
.markdown-viewer {
  img {
    display: block;
    max-width: 100%;
    height: auto;
    margin: 0.75rem 0 1rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
  }

  p,
  ul {
    margin-bottom: 1rem;
  }
}
</style>
