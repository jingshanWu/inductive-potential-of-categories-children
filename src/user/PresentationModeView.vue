<script setup>
// The landing page of the demo site (presentation mode: the `presentation`
// branch, deployed to its own link). It is for the lab, to click through the
// study: every clip and video has a Skip button there when fast forward is
// on (see design.js; off for now), and the parts of the study can be jumped
// to from here or from the menu at the top. Its data go to a record of their own, apart from the
// study's.
import { Button } from '@/uikit/components/ui/button'
import { Separator } from '@/uikit/components/ui/separator'
import useAPI from '@/core/composables/useAPI'
import { isFastForward } from '@/uikit/components/cdsc/fastForward'
const api = useAPI()
const fastForward = isFastForward()

const title = 'Inductive potential of categories (children)'
const subtitle = 'Demo of the child study, for the lab. Not the link for participants.'

// built when the site was last deployed
const lastupdated = __BUILD_TIME__

const projectauthors = [
  { name: 'Jingshan Wu', affiliation: 'New York University' },
  { name: 'Marjorie Rhodes', link: 'https://www.cdsc.nyu.edu', affiliation: 'New York University' },
]

// where to jump to, in the order of the study
const parts = [
  { view: 'welcome_referred', title: 'Welcome', text: 'The start of the study: welcome, sound check, window size, intro video, consent, child assent.' },
  { view: 'scaletraining', title: 'Scale training', text: 'The 5 dot cards and the 5 practice questions.' },
  { view: 'taskintro', title: 'Task intro', text: 'Zarpies are introduced.' },
  { view: 'training', title: 'Learning', text: 'The 16 videos of the assigned condition.' },
  { view: 'induction', title: 'Test', text: 'The 16 questions with the 5 Zarpie cards.' },
  { view: 'endcheck', title: 'End check', text: '"Now, two more questions."' },
  { view: 'preparent', title: 'Parent form', text: 'Hand back to the parent and the parent questionnaire.' },
]
</script>

<template>
  <div class="min-h-screen bg-background">
    <!-- Header Section -->
    <header class="bg-muted/50 border-b py-6">
      <div class="w-2/3 mx-auto px-6 py-8">
        <h1 class="text-5xl font-bold text-foreground mb-4 leading-tight">
          {{ title }}
        </h1>
        <p class="text-2xl text-muted-foreground leading-relaxed">
          {{ subtitle }}
        </p>
      </div>
    </header>

    <!-- Author Information Section -->
    <section class="border-b bg-background">
      <div class="w-2/3 mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div class="md:col-span-4">
            <h3 class="text-[0.65rem] font-extralight uppercase tracking-widest text-muted-foreground mb-4">Authors</h3>
            <div class="space-y-2">
              <div v-for="(author, index) in projectauthors" :key="index" class="text-[0.9rem]">
                <a
                  v-if="author.link"
                  :href="author.link"
                  class="text-foreground hover:text-primary transition-colors font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ author.name }}
                </a>
                <span v-else class="text-foreground font-medium">{{ author.name }}</span>
                <span class="text-muted-foreground"> · {{ author.affiliation }}</span>
              </div>
            </div>
          </div>
          <div class="md:col-span-4">
            <h3 class="text-[0.65rem] font-extralight uppercase tracking-widest text-muted-foreground mb-4">
              Last Updated
            </h3>
            <p class="text-[0.9rem] text-foreground">{{ lastupdated }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <main class="w-2/3 mx-auto px-6 py-12">
      <div class="prose prose-gray max-w-none mb-12">
        <p v-if="fastForward" class="text-lg text-muted-foreground leading-relaxed mb-4">
          This is the child study as the participants see it, with one difference: every clip and video has a
          <strong>Skip audio / Skip video</strong> button at the bottom right of the page, so the whole study can be
          clicked through in a few minutes. Leave the button alone to hear a page as a child would.
        </p>
        <p v-else class="text-lg text-muted-foreground leading-relaxed mb-4">
          This is the child study as the participants see it: every clip and video plays in full, as a child would
          hear it (the Skip buttons are off at the moment).
        </p>
        <p class="text-lg text-muted-foreground leading-relaxed mb-4">
          The study remembers where you were: reloading a page or coming back later continues from there. To start
          again, use the Reset button in the menu at the top. Data from this demo site are stored apart from the real
          study's data.
        </p>
      </div>

      <Separator class="my-8" />

      <div class="space-y-8">
        <div v-for="(part, index) in parts" :key="part.view">
          <Separator v-if="index > 0" class="mb-8" />
          <h3 class="text-xl font-semibold text-foreground mb-3">{{ part.title }}</h3>
          <p class="text-lg text-muted-foreground mb-4">{{ part.text }}</p>
          <Button size="sm" @click="api.goToView(part.view)">
            {{ part.title }}
            <i-lucide-arrow-right class="w-4 h-4 ml-2 inline" />
          </Button>
        </div>
      </div>
    </main>

    <footer class="bg-muted/50 border-t mt-16">
      <div class="w-2/3 mx-auto px-6 py-8 text-center">
        <p class="text-sm text-muted-foreground">
          Built with 🫠
          <a
            href="https://smile.gureckislab.org"
            class="text-primary hover:text-primary/80 transition-colors font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            Smile </a
          >.
        </p>
      </div>
    </footer>
  </div>
</template>
