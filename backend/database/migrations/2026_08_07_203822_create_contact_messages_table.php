public function up(): void
{
    Schema::create('contact_messages', function (Blueprint $table): void {
        $table->id();

        $table->string(
            'name',
            150,
        );

        $table->string(
            'company',
            150,
        )->nullable();

        $table->string(
            'email',
            150,
        );

        $table->string(
            'phone',
            20,
        );

        $table->string(
            'subject',
            150,
        );

        $table->text(
            'message',
        );

        $table->string(
            'status',
            30,
        )->default('pending');

        $table->timestamps();
    });
}