import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Example2 extends CustomTypeormEntityBase {
    static tableName = 'example2';
    example2_id = CustomTypeormFields.AutoPK({ db_column: 'example2_id' });
    name = CustomTypeormFields.CharacterString({ db_column: 'name' });
    title = CustomTypeormFields.CharacterString({ db_column: 'title' });
    user_id = CustomTypeormFields.Integer({ db_column: 'user_id' });
    age = CustomTypeormFields.Integer({ db_column: 'age' });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
