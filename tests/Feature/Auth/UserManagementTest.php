<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'super_admin']);
    }

    /** @test */
    public function admin_can_list_users(): void
    {
        User::factory()->count(5)->create(['role' => 'parishioner']);

        $response = $this->actingAs($this->admin)
                         ->getJson('/admin/api/users');

        $response->assertOk()
                 ->assertJsonStructure([
                     'data' => [['id', 'username', 'email', 'full_name', 'role', 'account_status']],
                     'current_page',
                     'total',
                 ]);
    }

    /** @test */
    public function admin_can_filter_users_by_role(): void
    {
        User::factory()->count(3)->create(['role' => 'parishioner']);
        User::factory()->count(2)->create(['role' => 'parish_admin']);

        $response = $this->actingAs($this->admin)
                         ->getJson('/admin/api/users?role=parish_admin');

        $response->assertOk();
        $this->assertEquals(2, $response->json('total'));
    }

    /** @test */
    public function admin_can_create_a_user(): void
    {
        $response = $this->actingAs($this->admin)
                         ->postJson('/admin/api/users', [
                             'username'    => 'testuser',
                             'email'       => 'test@bethel.com',
                             'password'    => 'SecurePass123!',
                             'role'        => 'parishioner',
                             'first_name'  => 'Juan',
                             'last_name'   => 'dela Cruz',
                             'birth_date'  => '1990-01-01',
                             'gender'      => 'Male',
                             'phone'       => '+63-917-000-0000',
                             'city'        => 'Manila',
                             'barangay'    => 'Sampaloc',
                         ]);

        $response->assertCreated()
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', ['email' => 'test@bethel.com']);
    }

    /** @test */
    public function admin_cannot_delete_their_own_account(): void
    {
        $response = $this->actingAs($this->admin)
                         ->deleteJson("/admin/api/users/{$this->admin->id}");

        $response->assertStatus(422)
                 ->assertJson(['message' => 'You cannot delete your own account.']);
    }

    /** @test */
    public function soft_deleted_user_is_not_in_default_listing(): void
    {
        $user = User::factory()->create(['role' => 'parishioner']);
        $userId = $user->id;

        // Soft delete
        $this->actingAs($this->admin)
             ->deleteJson("/admin/api/users/{$userId}");

        // Should not appear in listing
        $response = $this->actingAs($this->admin)
                         ->getJson('/admin/api/users');

        $ids = collect($response->json('data'))->pluck('id');
        $this->assertNotContains($userId, $ids);
    }

    /** @test */
    public function admin_can_get_user_stats(): void
    {
        User::factory()->count(3)->create(['role' => 'parishioner', 'account_status' => 'Active']);
        User::factory()->count(1)->create(['role' => 'parishioner', 'account_status' => 'Inactive']);

        $response = $this->actingAs($this->admin)
                         ->getJson('/admin/api/users/stats');

        $response->assertOk()
                 ->assertJsonStructure(['total', 'active', 'inactive', 'parishioners', 'admins']);
    }
}
