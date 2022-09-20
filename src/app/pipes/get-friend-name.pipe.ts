import { Pipe, PipeTransform } from '@angular/core';
import { collection, query, where, getDocs, Firestore } from '@angular/fire/firestore';

@Pipe({
  name: 'getFriendName'
})
export class GetFriendNamePipe implements PipeTransform {
  constructor(private firestore: Firestore) {}

  async transform(value: string) {
    const responsesRef = collection(
      this.firestore,
      "users"
    );
    const q = query(responsesRef, where('uid', '==', value));
    let doc;
    let docs = await getDocs(q);
    docs.forEach((d) => {
      doc = d.data().name;
    });

    return doc;
  }

}
