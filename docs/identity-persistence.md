# DreamTaily — DT-RE-010 identity persistence

## Modifica

`saveCharacter()` ora importa:

```js
import("./src/identity-prompt.js")
```

e salva il risultato in:

```text
character_assets.identity_prompt
```

Il nome del personaggio non entra nel prompt visivo: la funzione canonica lo ignora.

La libreria personaggi include ora `identity_prompt` nella SELECT, così il dato è
disponibile al futuro render job.

## Personaggi già esistenti

I personaggi creati prima della migration possono avere `identity_prompt = null`.

Non vengono modificati automaticamente da questo patch.

Nel render worker implementeremo una compatibilità sicura:

1. se `identity_prompt` esiste, usarlo;
2. altrimenti compilarlo da `traits.appearance`;
3. persisterlo una volta sul character asset prima di congelare il render job.

In questo modo non obblighiamo l'utente a ricreare i personaggi esistenti.

## Non modificato

- `src/story-composer.js`
- preview deterministica
- generazione personaggio
- canonicalizzazione reference
- checkout
