<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Migrations\Migration;

return new class () extends Migration {
    public function up(): void
    {
        // MariaDB JSON casting is unreliable here; store as plain text JSON.
        DB::statement('ALTER TABLE users MODIFY server_order LONGTEXT NULL');

        // Normalize any previously double-encoded values.
        $users = DB::table('users')->whereNotNull('server_order')->get(['id', 'server_order']);
        foreach ($users as $user) {
            $value = $user->server_order;
            for ($i = 0; $i < 3; $i++) {
                if (is_array($value)) {
                    break;
                }
                if (!is_string($value) || $value === '') {
                    $value = [];
                    break;
                }
                $decoded = json_decode($value, true);
                if (!is_array($decoded) && !is_string($decoded)) {
                    $value = [];
                    break;
                }
                $value = $decoded;
            }

            if (!is_array($value)) {
                $value = [];
            }

            DB::table('users')->where('id', $user->id)->update([
                'server_order' => json_encode(array_values($value)),
            ]);
        }
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users MODIFY server_order JSON NULL');
    }
};
