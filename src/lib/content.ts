import type { CollectionEntry } from 'astro:content';
export const showDraftContent=import.meta.env.DEV||import.meta.env.PUBLIC_SHOW_DRAFT_CONTENT==='true';
export function isVisible<T extends {data:{status:string}}>(entry:T):boolean{return showDraftContent||entry.data.status==='approved';}
export function sortByDateDesc(a:CollectionEntry<'articles'>,b:CollectionEntry<'articles'>):number{return b.data.publishDate.valueOf()-a.data.publishDate.valueOf();}
