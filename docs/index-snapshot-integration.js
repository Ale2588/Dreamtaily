// DreamTaily — integrare in index.html

async function dtPersistContentSnapshot(book){
  if(!app.activeBookStoryId) throw new Error("BOOK_STORY_REQUIRED");
  const {error}=await getSupabase()
    .from("book_stories")
    .update({
      content_snapshot:book,
      updated_at:new Date().toISOString()
    })
    .eq("id",app.activeBookStoryId);
  if(error) throw error;
}

// In finishStoryComposer(), subito dopo la validazione marker e PRIMA di renderBookSummary():
// await dtPersistContentSnapshot(dtComposedBook);
