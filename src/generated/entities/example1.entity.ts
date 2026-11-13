import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Example1 extends CustomTypeormEntityBase {
    static tableName = 'example1';
    example1_id = CustomTypeormFields.AutoPK({ db_column: 'example1_id' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    title = CustomTypeormFields.CharacterString({ db_column: 'title' });
    age = CustomTypeormFields.Integer({ db_column: 'age' });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
