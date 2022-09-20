import { Pipe, PipeTransform } from '@angular/core';
import { collection, query, where, getDocs, Firestore } from '@angular/fire/firestore';

@Pipe({
  name: 'getFriend'
})
export class GetFriendPipe implements PipeTransform {

  constructor(private firestore: Firestore) {}

  async transform(value: string, ...args: string[]) {
    const responsesRef = collection(
      this.firestore,
      "users"
    );
    const q = query(responsesRef, where('uid', '==', value));
    let doc;
    let docs = await getDocs(q);
    docs.forEach((d) => {
      doc = d.data();
    });

    if (args.length === 1)
      return doc[args[0]];
    else return doc[args[0]][args[1]];
  }

}
