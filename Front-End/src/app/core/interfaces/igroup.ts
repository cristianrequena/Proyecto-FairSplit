export interface IGroup {
        group_id: string;
        title: string;
        description: string;
        creation_date: Date;
        num_participants?: number;
        total_amount?: number; 
        total_a_pagar?: number; 
        balance_difference?: number;
        gastos?: string[]; 
        pagos?: string[]; 
        participants: string[];
        creator_id?: string
        creator_url_photo?: string
}

