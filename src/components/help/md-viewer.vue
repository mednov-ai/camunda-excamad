<template>
  <div class="markdown-viewer">
    <div v-if="loading" class="markdown-viewer__state">Loading help article...</div>
    <div v-else-if="error" class="oc-empty-state markdown-viewer__error">
      {{ error }}
    </div>
    <div v-else v-html="renderedMarkdown"></div>
  </div>
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

const looksLikeHtmlFallback = value => {
  const text = String(value || '').trim().slice(0, 400).toLowerCase();
  return text.startsWith('<!doctype html') || text.includes('<div id="app"');
};

export default {
  name: 'md-viewer',
  props: {
    src: { type: String, required: true }
  },
  data() {
    return {
      error: '',
      loading: true,
      mdText: ''
    };
  },
  computed: {
    renderedMarkdown() {
      return renderMarkdown(this.mdText);
    }
  },
  watch: {
    src() {
      this.loadMarkdown();
    }
  },
  mounted() {
    this.loadMarkdown();
  },
  methods: {
    markdownRequestUrl() {
      const separator = this.src.includes('?') ? '&' : '?';
      return `${this.src}${separator}_=${Date.now()}`;
    },
    async loadMarkdown() {
      this.loading = true;
      this.error = '';
      this.mdText = '';

      try {
        const response = await axios.get(this.markdownRequestUrl(), {
          headers: {
            Accept: 'text/markdown,text/plain,*/*'
          }
        });

        if (looksLikeHtmlFallback(response.data)) {
          this.error = `Help page not found: ${this.src}`;
          return;
        }

        this.mdText = response.data;
      } catch (error) {
        this.error = `Help page not found: ${this.src}`;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="scss">
.markdown-viewer {
  padding: 1.25rem;
  color: var(--oc-text);

  h1,
  h2,
  h3,
  h4 {
    margin: 1.25rem 0 0.75rem;
    color: var(--oc-text);
    font-weight: 650;
    letter-spacing: 0;
  }

  h1:first-child,
  h2:first-child,
  h3:first-child {
    margin-top: 0;
  }

  h1 {
    font-size: 1.45rem;
  }

  h2 {
    font-size: 1.15rem;
  }

  h3 {
    font-size: 1rem;
  }

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

  code {
    padding: 0.1rem 0.25rem;
    border: 1px solid var(--oc-border);
    border-radius: 4px;
    background: var(--oc-surface-muted);
    color: var(--oc-text);
  }
}

.markdown-viewer__state {
  color: var(--oc-text-muted);
}

.markdown-viewer__error {
  margin: 0;
}
</style>
