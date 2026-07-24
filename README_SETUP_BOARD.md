# Setup board — click/tap

La plancia usa un solo modello di interazione su desktop e mobile:

- il protagonista è mostrato nell’intestazione, fuori dall’area delle scelte;
- l’atmosfera si sceglie con click o tap su una carta;
- l’aiutante è presentato come promessa narrativa e viene scelto nel passo corretto.

Persistenza invariata:

- protagonista e aiutante in `story_cast_assignments`;
- setup e branch in `book_stories.path_choices`.

Il drag & drop e i relativi handler sono stati rimossi.
