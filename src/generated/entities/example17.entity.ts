import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Example17 extends CustomTypeormEntityBase {
    static tableName = 'example17';
    example17_id = CustomTypeormFields.AutoPK({ db_column: 'example17_id' });
    name_1 = CustomTypeormFields.CharacterString({ db_column: 'name_1' });
    title_2 = CustomTypeormFields.Text({ db_column: 'title_2' });
    age_1 = CustomTypeormFields.Integer({ db_column: 'age_1' });
    user_id_1 = CustomTypeormFields.FK({
        model_name: 'example2',
        db_column: 'user_id_1',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
