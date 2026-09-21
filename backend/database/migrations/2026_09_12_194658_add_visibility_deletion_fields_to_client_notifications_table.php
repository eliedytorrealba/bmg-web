<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table(
            'client_notifications',
            function (Blueprint $table): void {
                $table
                    ->timestamp('admin_deleted_at')
                    ->nullable()
                    ->after('read_at');

                $table
                    ->timestamp('client_deleted_at')
                    ->nullable()
                    ->after('admin_deleted_at');

                $table->index(
                    'admin_deleted_at',
                );

                $table->index(
                    'client_deleted_at',
                );
            },
        );
    }

    public function down(): void
    {
        Schema::table(
            'client_notifications',
            function (Blueprint $table): void {
                $table->dropIndex([
                    'admin_deleted_at',
                ]);

                $table->dropIndex([
                    'client_deleted_at',
                ]);

                $table->dropColumn([
                    'admin_deleted_at',
                    'client_deleted_at',
                ]);
            },
        );
    }
};