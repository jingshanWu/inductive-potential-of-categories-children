/**
 * The parts of the lab's consent slides that differ from study to study.
 * Read by the lab's default consent pages (src/builtins/cdsc_default:
 * ConsentSections.vue, shown by ParentConsentView.vue and ConsentText.vue).
 * Everything else on those pages is the lab's standard wording for all
 * studies (PANDA consent and assent slides, version of 2024-12-17,
 * IRB-FY2024-9169).
 */
export default {
  // "About the Study" slide: "This study seeks to find out:" (shown in the highlighted box)
  seeksToFindOut: 'How do children learn about social groups?',

  // "About the Study" slide: "The results of this study may help us identify ..."
  // Write the rest of that sentence for this study, or leave null to leave
  // the bullet out. (The lab's template says: "[replace with something
  // similarly specific] how statistical reasoning might contribute to - and
  // could be used to combat - the development of social stereotypes.")
  resultsMayHelpIdentify: null,

  // "What Will My Child Do?" slide: "Sessions last no longer than N minutes."
  maxMinutes: 15,
}
