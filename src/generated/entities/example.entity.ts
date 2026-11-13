import { CustomTypeormEntityBase, CustomTypeormFields } from '@vyapti/core';
export class Example extends CustomTypeormEntityBase {
    static tableName = 'example';
    example_id = CustomTypeormFields.AutoPK({ db_column: 'example_id' });
    title = CustomTypeormFields.CharacterString({ db_column: 'title' });
    parent_id = CustomTypeormFields.FK({
        model_name: 'example',
        db_column: 'parent_id',
    });
    deleted_at = CustomTypeormFields.Integer({
        db_column: 'deleted_at',
        null: true,
    });
}
